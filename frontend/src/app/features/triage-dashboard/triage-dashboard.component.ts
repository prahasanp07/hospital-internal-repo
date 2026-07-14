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
    <div class="w-full h-full flex flex-col md:flex-row gap-6 p-2">
      <!-- Central File Upload Screen -->
      <div class="flex-1 glass-panel flex flex-col p-6 min-h-[500px]">
        <h2 class="text-2xl font-semibold mb-4 text-[#2B3654]">Medical Imaging Upload</h2>
        <div class="flex-1 rounded-2xl overflow-hidden bg-white/20 border border-white/40 shadow-inner flex items-center justify-center">
          <app-image-viewer class="w-full h-full"></app-image-viewer>
        </div>
      </div>

      <!-- Right Column Results -->
      <div class="w-full md:w-[450px] lg:w-[500px] glass-panel p-6 overflow-y-auto">
        <h2 class="text-2xl font-semibold mb-4 text-[#2B3654]">AI Assessment Results</h2>
        <app-triage-form [triageData]="triageData$ | async" class="w-full block"></app-triage-form>
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
