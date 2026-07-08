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
    <div class="scribe-container" #container>
      <div class="header">
        <h1>EHR & Scribe Integration</h1>
        <p>Paste ambient consultation transcripts below to automatically extract structured FHIR records using MedGemma AI Core.</p>
      </div>

      <div class="content-split">
        <!-- Input Section -->
        <div class="input-section" #inputSection>
          <div class="card">
            <h3>Consultation Transcript</h3>
            <textarea 
              [(ngModel)]="transcript" 
              placeholder="e.g., Patient John Doe, 45, presents with mild hypertension. Prescribed Lisinopril 10mg daily."
              rows="12">
            </textarea>
            
            <button class="btn-process" (click)="processTranscript()" [disabled]="isLoading || !transcript.trim()">
              <span *ngIf="!isLoading">Extract FHIR Data</span>
              <span *ngIf="isLoading" class="spinner"></span>
            </button>
            
            <div *ngIf="error" class="error-msg">
              {{ error }}
            </div>
          </div>
        </div>

        <!-- Output Section -->
        <div class="output-section" #outputSection>
          <div class="card fhir-card">
            <div class="card-header">
              <div style="display: flex; align-items: center; gap: 12px;">
                <h3>Extracted FHIR R4 JSON</h3>
                <div class="badge" *ngIf="fhirResult">Valid Resource</div>
              </div>
              <button *ngIf="fhirResult" type="button" mat-icon-button (click)="copyFhirJson()" class="copy-btn" title="Copy FHIR JSON" (mouseenter)="onHover($event)" (mouseleave)="onLeave($event)">
                <mat-icon>content_copy</mat-icon>
              </button>
            </div>
            
            <div class="code-container" *ngIf="fhirResult">
              <pre><code>{{ fhirResult | json }}</code></pre>
            </div>
            
            <div class="empty-state" *ngIf="!fhirResult && !isLoading">
              <div class="icon">🧬</div>
              <p>Awaiting transcript processing...</p>
            </div>

            <div class="loading-state" *ngIf="isLoading">
              <div class="pulse-ring"></div>
              <p>Reasoning with AI Core...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scribe-container {
      width: 100%;
      height: 100vh;
      padding: 32px;
      overflow-y: auto;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #f1f5f9;
      font-family: 'Inter', sans-serif;
    }
    .header {
      margin-bottom: 32px;
    }
    .header h1 {
      font-size: 2rem;
      margin-bottom: 8px;
      font-weight: 600;
      color: #38bdf8;
    }
    .header p {
      color: #94a3b8;
      font-size: 1.1rem;
    }
    .content-split {
      display: flex;
      gap: 32px;
      height: calc(100% - 120px);
    }
    .input-section, .output-section {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .card {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      height: 100%;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      backdrop-filter: blur(10px);
    }
    .card h3 {
      margin-top: 0;
      margin-bottom: 16px;
      font-weight: 500;
      color: #e2e8f0;
      font-size: 1.25rem;
    }
    textarea {
      flex: 1;
      width: 100%;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 16px;
      color: #f8fafc;
      font-family: 'Inter', sans-serif;
      font-size: 1rem;
      resize: none;
      margin-bottom: 16px;
      transition: border-color 0.3s ease;
    }
    textarea:focus {
      outline: none;
      border-color: #38bdf8;
    }
    .btn-process {
      background: linear-gradient(90deg, #38bdf8, #818cf8);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 14px 24px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, opacity 0.2s, box-shadow 0.2s;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 4px 15px rgba(56, 189, 248, 0.4);
    }
    .btn-process:hover:not([disabled]) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(56, 189, 248, 0.6);
    }
    .btn-process:active:not([disabled]) {
      transform: translateY(0);
    }
    .btn-process[disabled] {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .error-msg {
      margin-top: 16px;
      padding: 12px;
      background: rgba(239, 68, 68, 0.1);
      border-left: 4px solid #ef4444;
      color: #fca5a5;
      border-radius: 4px;
    }
    .fhir-card {
      background: rgba(15, 23, 42, 0.8);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .card-header h3 {
      margin-bottom: 0;
    }
    .copy-btn {
      color: #38bdf8;
    }
    .badge {
      background: rgba(34, 197, 94, 0.2);
      color: #4ade80;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      border: 1px solid rgba(34, 197, 94, 0.4);
    }
    .code-container {
      flex: 1;
      overflow-y: auto;
      background: #0b1120;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    pre {
      margin: 0;
      font-family: 'Fira Code', monospace;
      font-size: 0.9rem;
      color: #a5b4fc;
      white-space: pre-wrap;
    }
    .empty-state, .loading-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #64748b;
    }
    .empty-state .icon {
      font-size: 4rem;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    .pulse-ring {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(56, 189, 248, 0.2);
      animation: pulse 1.5s infinite;
      margin-bottom: 24px;
    }
    @keyframes pulse {
      0% { transform: scale(0.8); opacity: 0.8; }
      100% { transform: scale(1.5); opacity: 0; }
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

      // Small artificial delay for animation impact if the response was too fast
      await new Promise(r => setTimeout(r, 600));

      this.fhirResult = data;

      // Animate the result container appearing
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

  onHover(event: MouseEvent) {
    gsap.to(event.currentTarget, { scale: 1.15, duration: 0.2, ease: 'power1.out' });
  }

  onLeave(event: MouseEvent) {
    gsap.to(event.currentTarget, { scale: 1, duration: 0.2, ease: 'power1.in' });
  }
}
