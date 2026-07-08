import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { TriageState } from '../../../store/triage.actions';
import gsap from 'gsap';

@Component({
  selector: 'app-triage-form',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="form-container glass-panel" #formPanel>
      <h2 class="title">Triage Assessment</h2>
      <form [formGroup]="formGroup">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label class="label-text">Anatomical Location</mat-label>
          <input matInput formControlName="anatomicalLocation" />
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label class="label-text">Urgency Tier</mat-label>
          <mat-select class="label-text" formControlName="urgencyTier">
            <mat-option value="LOW">LOW</mat-option>
            <mat-option value="MEDIUM">MEDIUM</mat-option>
            <mat-option value="HIGH">HIGH</mat-option>
            <mat-option value="UNKNOWN">UNKNOWN</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="findings-container full-width">
          <div class="findings-label">Findings</div>
          <div class="chips-wrapper">
            @for (finding of (triageData?.findings || []); track $index) {
              <div class="finding-chip">
                <mat-icon class="finding-icon">check_circle</mat-icon>
                <span>{{ finding }}</span>
              </div>
            } @empty {
              <div class="finding-chip empty-chip">No findings recorded.</div>
            }
          </div>
        </div>
        <div style="position: relative;">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label class="label-text">Draft Report Text</mat-label>
            <textarea matInput formControlName="draftReportText" rows="6"></textarea>
          </mat-form-field>
          <button type="button" mat-icon-button (click)="copyReport()" class="copy-btn" title="Copy Report text" (mouseenter)="onHover($event)" (mouseleave)="onLeave($event)">
            <mat-icon>content_copy</mat-icon>
          </button>
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
    .copy-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      color: #38bdf8;
      z-index: 10;
    }
    ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: rgba(255, 255, 255, 0.05) !important;
      border-radius: 8px !important;
    }
    ::ng-deep .mdc-notched-outline__leading,
    ::ng-deep .mdc-notched-outline__notch,
    ::ng-deep .mdc-notched-outline__trailing {
      border-color: rgba(255, 255, 255, 0.2) !important;
    }
    ::ng-deep .mat-mdc-form-field-focus-overlay {
      background-color: rgba(56, 189, 248, 0.1) !important;
    }
    ::ng-deep input.mat-mdc-input-element, ::ng-deep textarea.mat-mdc-input-element, ::ng-deep .mat-mdc-select-value-text {
      color: #f8fafc !important;
    }
    ::ng-deep .mat-mdc-form-field-label {
      color: #94a3b8 !important;
    }
    ::ng-deep .mat-focused .mat-mdc-form-field-label {
      color: #38bdf8 !important;
    }
    ::ng-deep .mat-focused .mdc-notched-outline__leading,
    ::ng-deep .mat-focused .mdc-notched-outline__notch,
    ::ng-deep .mat-focused .mdc-notched-outline__trailing {
      border-color: #38bdf8 !important;
    }
    .label-text {
      color: #f8fafc !important;
    }
    .findings-container {
      margin-bottom: 24px;
      padding: 16px;
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .findings-label {
      color: #38bdf8;
      font-size: 12px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }
    .chips-wrapper {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .finding-chip {
      display: flex;
      align-items: flex-start;
      background: rgba(56, 189, 248, 0.05);
      border-left: 3px solid #38bdf8;
      padding: 12px 16px;
      border-radius: 6px;
      color: #f8fafc;
      font-size: 14px;
      line-height: 1.5;
    }
    .finding-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      margin-right: 12px;
      color: #38bdf8;
      flex-shrink: 0;
    }
    .empty-chip {
      border-left: 3px solid #64748b;
      background: rgba(100, 116, 139, 0.1);
      color: #94a3b8;
    }
  `]
})
export class TriageFormComponent implements OnChanges {
  @Input() triageData: TriageState | null = null;
  @ViewChild('formPanel', { static: true }) formPanel!: ElementRef;

  formGroup: FormGroup;

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

      // GSAP Animation to elegantly reveal new data
      gsap.fromTo(this.formPanel.nativeElement,
        { y: 20, opacity: 0.8 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );
    }
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
