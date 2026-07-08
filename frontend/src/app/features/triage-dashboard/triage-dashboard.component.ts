import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { TriageState, loadTriageEvent } from '../../store/triage.actions';
import { selectTriageData } from '../../store/triage.selectors';
import { TriageFormComponent } from './triage-form/triage-form.component';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';

@Component({
  selector: 'app-triage-dashboard',
  standalone: true,
  imports: [CommonModule, TriageFormComponent, ImageViewerComponent],
  template: `
    <div class="dashboard-container">
      <div class="left-column">
        <app-image-viewer></app-image-viewer>
      </div>
      <div class="right-column">
        <app-triage-form [triageData]="triageData$ | async"></app-triage-form>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      width: 83vw;
      height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #f1f5f9;
      font-family: 'Inter', sans-serif;
    }
    .left-column {
      flex: 1 1 50%;
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      min-width: 0;
    }
    .right-column {
      flex: 1 1 50%;
      max-width: 800px;
      padding: 32px;
      overflow-y: auto;
      min-width: 0;
    }
  `]
})
export class TriageDashboardComponent implements OnInit, OnDestroy {
  triageData$;
  private eventSource!: EventSource;

  constructor(private store: Store<{ triage: TriageState }>) {
    this.triageData$ = this.store.select(selectTriageData);
  }

  ngOnInit() {
    this.eventSource = new EventSource('http://localhost:3000/api/triage/stream');
    this.eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        this.store.dispatch(loadTriageEvent({ payload }));
      } catch (e) {
        console.error('Error parsing SSE payload', e);
      }
    };
  }

  ngOnDestroy() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}
