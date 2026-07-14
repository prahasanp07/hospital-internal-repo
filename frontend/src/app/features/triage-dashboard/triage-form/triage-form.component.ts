import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { TriageState } from '../../../store/triage.actions';
import gsap from 'gsap';

@Component({
  selector: 'app-triage-form',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule],
  template: `
    <div class="form-container glass-panel" #formPanel>
      
      <!-- Global Severity Banner -->
      <div class="severity-banner" #severityBanner *ngIf="triageData?.urgencyTier" [ngClass]="{
        'tier-high': triageData?.urgencyTier === 'HIGH',
        'tier-medium': triageData?.urgencyTier === 'MEDIUM',
        'tier-low': triageData?.urgencyTier === 'LOW',
        'tier-unknown': triageData?.urgencyTier === 'UNKNOWN'
      }">
        <div class="banner-title">TRIAGE TIER</div>
        <div class="banner-value">{{ triageData?.urgencyTier }}</div>
      </div>

      <h2 class="title">Triage Assessment</h2>
      
      <form [formGroup]="formGroup">
        <div class="anatomical-location-box">
          <div class="findings-label">Anatomical Location</div>
          <div class="text-content">{{ formGroup.get('anatomicalLocation')?.value || 'Pending...' }}</div>
        </div>
        
        <!-- Critical Bullet Cards (Findings) -->
        <div class="findings-container full-width">
          <div class="findings-label">Findings</div>
          <div class="cards-wrapper">
            @for (finding of (triageData?.findings || []); track $index) {
              <div class="finding-card">
                
                <!-- SVG Icon Logic based on severity -->
                <div class="icon-wrapper">
                  @if (getFindingSeverity(finding) === 'critical') {
                    <svg xmlns="http://www.w3.org/2000/svg" class="critical-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  } @else if (getFindingSeverity(finding) === 'incidental') {
                    <svg xmlns="http://www.w3.org/2000/svg" class="incidental-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="neutral-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  }
                </div>
                <span class="finding-text">{{ finding }}</span>
              </div>
            } @empty {
              <div class="finding-card empty-card">No findings recorded.</div>
            }
          </div>
        </div>

        <!-- Draft Report Text Expansion Panel -->
        <div class="report-container">
          <div class="report-header">
            <span class="findings-label">Draft Report Text</span>
            
            <button type="button" class="icon-btn" (click)="copyReport()" title="Copy Report text" (mouseenter)="onHover($event)" (mouseleave)="onLeave($event)">
              <!-- Standard SVG copy icon -->
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
          </div>

          <div class="report-preview" *ngIf="!isReportExpanded && formGroup.get('draftReportText')?.value">
            {{ getTruncatedReport() }}
          </div>
          
          <button type="button" mat-stroked-button class="expand-btn text-white" (click)="toggleReport()" *ngIf="formGroup.get('draftReportText')?.value">
            {{ isReportExpanded ? 'Collapse Full Clinical Text' : 'Expand Full Clinical Text' }}
          </button>

          <div class="report-editor" [class.expanded]="isReportExpanded">
             <mat-form-field appearance="outline" class="full-width" *ngIf="isReportExpanded">
                <textarea matInput formControlName="draftReportText" rows="6"></textarea>
             </mat-form-field>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .glass-panel {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: 24px;
      padding: 32px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      position: relative;
    }
    
    .severity-banner {
      margin-bottom: 24px;
      padding: 16px 24px;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .tier-high {
      background: rgba(220, 38, 38, 0.15);
      border: 1px solid rgba(220, 38, 38, 0.5);
    }
    .tier-high .banner-value { color: #fca5a5; text-shadow: 0 0 10px rgba(220, 38, 38, 0.5); }
    
    .tier-medium {
      background: rgba(217, 119, 6, 0.15);
      border: 1px solid rgba(217, 119, 6, 0.5);
    }
    .tier-medium .banner-value { color: #fcd34d; text-shadow: 0 0 10px rgba(217, 119, 6, 0.5); }
    
    .tier-low {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.5);
    }
    .tier-low .banner-value { color: #6ee7b7; text-shadow: 0 0 10px rgba(16, 185, 129, 0.5); }

    .tier-unknown {
      background: rgba(148, 163, 184, 0.15);
      border: 1px solid rgba(148, 163, 184, 0.5);
    }
    .tier-unknown .banner-value { color: #cbd5e1; }

    .banner-title {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1px;
      color: rgba(255, 255, 255, 0.7);
    }
    .banner-value {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 24px;
      color: #38bdf8;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .anatomical-location-box {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 24px;
    }
    .anatomical-location-box .text-content {
      color: #f8fafc;
      font-size: 15px;
      line-height: 1.5;
      word-break: break-word;
    }
    
    /* Input Overrides */
    ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: rgba(255, 255, 255, 0.05) !important;
      border-radius: 8px !important;
    }
    ::ng-deep .mdc-notched-outline__leading,
    ::ng-deep .mdc-notched-outline__notch,
    ::ng-deep .mdc-notched-outline__trailing {
      border-color: rgba(255, 255, 255, 0.2) !important;
    }
    ::ng-deep input.mat-mdc-input-element, ::ng-deep textarea.mat-mdc-input-element {
      color: #f8fafc !important;
    }
    ::ng-deep .mat-mdc-form-field-label {
      color: #94a3b8 !important;
    }
    
    /* Findings Styling */
    .findings-container {
      margin-bottom: 24px;
    }
    .findings-label {
      color: #38bdf8;
      font-size: 12px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }
    .cards-wrapper {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .finding-card {
      display: flex;
      align-items: flex-start;
      background: #1e293b;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #f8fafc;
      font-size: 14px;
      line-height: 1.6;
      position: relative;
    }
    .icon-wrapper {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      margin-right: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .critical-icon { color: #f87171; }
    .incidental-icon { color: #94a3b8; }
    .neutral-icon { color: #38bdf8; }
    
    .empty-card {
      color: #94a3b8;
      font-style: italic;
    }

    /* Report Text Panel */
    .report-container {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      padding: 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .report-preview {
      color: #cbd5e1;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 16px;
      font-style: italic;
    }
    .expand-btn {
      width: 100%;
      margin-bottom: 12px;
      color: #38bdf8;
      border-color: rgba(56, 189, 248, 0.3) !important;
    }
    .report-editor {
      display: none;
    }
    .report-editor.expanded {
      display: block;
      margin-top: 16px;
    }

    /* Inline Button Reset */
    .icon-btn {
      background: transparent;
      border: none;
      color: #38bdf8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .icon-btn:hover {
      background: rgba(56, 189, 248, 0.1);
    }
  `]
})
export class TriageFormComponent implements OnChanges {
  @Input() triageData: TriageState | null = null;
  @ViewChild('formPanel', { static: true }) formPanel!: ElementRef;
  @ViewChild('severityBanner') severityBanner!: ElementRef;

  formGroup: FormGroup;
  isReportExpanded = false;

  constructor(
    private fb: FormBuilder,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar
  ) {
    this.formGroup = this.fb.group({
      anatomicalLocation: [''],
      urgencyTier: [''],
      draftReportText: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['triageData'] && this.triageData) {
      this.formGroup.patchValue({
        anatomicalLocation: this.triageData.anatomicalLocation,
        urgencyTier: this.triageData.urgencyTier,
        draftReportText: this.triageData.draftReportText
      });

      // Panel animation
      gsap.fromTo(this.formPanel.nativeElement,
        { y: 20, opacity: 0.8 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );

      // Severity banner pop animation
      setTimeout(() => {
        if (this.severityBanner) {
          gsap.fromTo(this.severityBanner.nativeElement,
            { scale: 0.95, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
          );
        }
      }, 50);
    }
  }

  getFindingSeverity(finding: string): 'critical' | 'incidental' | 'neutral' {
    const text = finding.toLowerCase();

    // Critical keywords
    const criticalWords = ['malignancy', 'suspicious', 'spiculated', 'opacity', 'severe', 'acute', 'critical', 'fracture', 'hemorrhage', 'nodule'];
    if (criticalWords.some(w => text.includes(w))) return 'critical';

    // Incidental keywords
    const incidentalWords = ['calcification', 'atherosclerotic', 'mild', 'chronic', 'unremarkable', 'degenerative'];
    if (incidentalWords.some(w => text.includes(w))) return 'incidental';

    return 'neutral';
  }

  getTruncatedReport(): string {
    const text = this.formGroup.get('draftReportText')?.value || '';
    if (text.length <= 150) return text;
    return text.substring(0, 150) + '...';
  }

  toggleReport() {
    this.isReportExpanded = !this.isReportExpanded;
  }

  copyReport() {
    const text = this.formGroup.get('draftReportText')?.value;
    if (text) {
      this.clipboard.copy(text);
      this.snackBar.open('Report copied to clipboard.', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
    }
  }

  onHover(event: MouseEvent) {
    gsap.to(event.currentTarget, { scale: 1.15, duration: 0.2, ease: 'power1.out' });
  }

  onLeave(event: MouseEvent) {
    gsap.to(event.currentTarget, { scale: 1, duration: 0.2, ease: 'power1.in' });
  }
}
