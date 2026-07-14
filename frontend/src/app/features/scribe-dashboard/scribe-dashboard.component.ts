import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import gsap from 'gsap';

@Component({
  selector: 'app-scribe-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="w-full h-full flex flex-col p-2" #container>
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-[#4A83F6] tracking-tight mb-2">EHR & Scribe Integration</h1>
        <p class="text-[#8E9BB8] text-lg">Paste ambient consultation transcripts below to automatically extract structured FHIR records using MedGemma AI Core.</p>
      </div>

      <div class="flex flex-col md:flex-row gap-6 h-full min-h-[500px]">
        
        <!-- Input Section (Left) -->
        <div class="flex-1 glass-panel p-6 flex flex-col" #inputSection>
          <h3 class="text-xl font-semibold text-[#2B3654] mb-4">Consultation Transcript</h3>
          <textarea 
            [(ngModel)]="transcript" 
            placeholder="e.g., Patient John Doe, 45, presents with mild hypertension. Prescribed Lisinopril 10mg daily."
            class="flex-1 w-full bg-white/50 border border-white/60 rounded-xl p-4 text-[#2B3654] font-sans resize-none focus:outline-none focus:ring-2 focus:ring-[#4A83F6]/50 shadow-sm transition-all mb-4">
          </textarea>
          
          <button class="w-full bg-gradient-to-r from-[#4A83F6] to-[#818cf8] text-white rounded-xl py-3.5 font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center" 
                  (click)="processTranscript()" 
                  [disabled]="isLoading || !transcript.trim()">
            <span *ngIf="!isLoading">Extract FHIR Data</span>
            <svg *ngIf="isLoading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
          
          <div *ngIf="error" class="mt-4 p-3 bg-red-500/10 border-l-4 border-red-500 text-red-600 rounded-r-md">
            {{ error }}
          </div>
        </div>

        <!-- Output Section (Right) -->
        <div class="flex-1 glass-panel-blue p-6 flex flex-col bg-gradient-to-br from-[#4b84f3]/80 to-[#366ada]/90 text-white" #outputSection>
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center gap-3">
              <h3 class="text-xl font-semibold">Extracted FHIR R4 JSON</h3>
              <div *ngIf="fhirResult" class="bg-green-400/20 text-green-100 px-3 py-1 rounded-full text-xs font-bold border border-green-400/30">
                Valid Resource
              </div>
            </div>
            <button *ngIf="fhirResult" type="button" mat-icon-button (click)="copyFhirJson()" class="text-white hover:text-blue-200 transition-colors" title="Copy FHIR JSON">
              <mat-icon>content_copy</mat-icon>
            </button>
          </div>
          
          <div *ngIf="fhirResult" class="flex-1 overflow-y-auto bg-[#0b1120]/50 p-4 rounded-xl border border-white/10 code-container">
            <pre class="font-mono text-sm text-blue-100 whitespace-pre-wrap m-0"><code>{{ fhirResult | json }}</code></pre>
          </div>
          
          <div *ngIf="!fhirResult && !isLoading" class="flex-1 flex flex-col justify-center items-center text-blue-100/60">
            <div class="text-6xl mb-4 opacity-50">🧬</div>
            <p>Awaiting transcript processing...</p>
          </div>

          <div *ngIf="isLoading" class="flex-1 flex flex-col justify-center items-center text-white">
            <div class="w-16 h-16 rounded-full bg-white/20 animate-ping mb-6"></div>
            <p class="font-medium animate-pulse">Reasoning with AI Core...</p>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class ScribeDashboardComponent implements AfterViewInit {
  transcript: string = '';
  fhirResult: any = null;
  isLoading: boolean = false;
  error: string | null = null;

  @ViewChild('inputSection') inputSection!: ElementRef;
  @ViewChild('outputSection') outputSection!: ElementRef;
  @ViewChild('container') container!: ElementRef;

  constructor(private clipboard: Clipboard, private snackBar: MatSnackBar) {}

  ngAfterViewInit() {
    gsap.from(this.inputSection.nativeElement, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out',
      delay: 0.2
    });

    gsap.from(this.outputSection.nativeElement, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out',
      delay: 0.4
    });
  }

  async processTranscript() {
    if (!this.transcript.trim()) return;

    this.isLoading = true;
    this.error = null;
    this.fhirResult = null;

    try {
      const response = await fetch('http://localhost:3000/api/scribe/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transcript: this.transcript })
      });

      if (!response.ok) {
        throw new Error("Server error: " + response.statusText);
      }

      const data = await response.json();

      await new Promise(r => setTimeout(r, 600));

      this.fhirResult = data;

      setTimeout(() => {
        const codeContainer = this.container.nativeElement.querySelector('.code-container');
        if (codeContainer) {
          gsap.from(codeContainer, {
            scale: 0.95,
            opacity: 0,
            duration: 0.5,
            ease: 'back.out(1.5)'
          });
        }
      }, 50);

    } catch (err: any) {
      this.error = err.message || 'An error occurred while processing the transcript.';
    } finally {
      this.isLoading = false;
    }
  }

  copyFhirJson() {
    if (this.fhirResult) {
      this.clipboard.copy(JSON.stringify(this.fhirResult, null, 2));
      this.snackBar.open('FHIR JSON copied to clipboard.', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
    }
  }
}
