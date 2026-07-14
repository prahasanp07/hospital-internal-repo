import { Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface FilePreview {
  file: File;
  url: string;
  isImage: boolean;
  name: string;
}

@Component({
  selector: 'app-image-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="image-viewport" (click)="triggerFileInput()" [class.has-files]="isUploaded">
      
      <div class="preview-container" *ngIf="isUploaded">
        <div class="preview-card" *ngFor="let preview of previews">
          <img *ngIf="preview.isImage" [src]="preview.url" alt="Preview" />
          <div *ngIf="!preview.isImage" class="pdf-card">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-file-text"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span class="file-name">{{ preview.name }}</span>
          </div>
        </div>
      </div>
      
      <div class="mock-grid" *ngIf="!isUploaded">
         <img src="https://via.placeholder.com/600x800/0f172a/f1f5f9?text=Medical+Imagery+Mock" alt="Medical Image" class="mock-image" />
      </div>

      <div class="overlay-glass">
        <div class="upload-content">
          <svg *ngIf="!isUploading" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <div *ngIf="isUploading" class="spinner"></div>
          <span>{{ isUploading ? 'Uploading & Analyzing...' : (isUploaded ? 'Upload Additional Files' : 'Click to Upload Files (Images/PDF)') }}</span>
        </div>
      </div>
      
      <input type="file" multiple #fileInput (change)="onFileSelected($event)" accept="image/png, image/jpeg, image/webp, application/pdf, .dat" style="display: none;" />
    </div>
  `,
  styles: [`
    .image-viewport {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 500px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      background: #0f172a;
    }
    .image-viewport.has-files {
      background: rgba(30, 41, 59, 0.5);
      border: 1px dashed rgba(56, 189, 248, 0.5);
    }
    .image-viewport:hover {
      transform: translateY(-2px);
      box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.6);
    }
    .preview-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      padding: 24px;
      padding-bottom: 140px; /* Space for overlay */
      height: 100%;
      overflow-y: auto;
      align-content: start;
    }
    .preview-card {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      aspect-ratio: 3/4;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .preview-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .pdf-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 12px;
      color: #94a3b8;
      text-align: center;
    }
    .pdf-card svg {
      color: #ef4444;
      margin-bottom: 8px;
    }
    .file-name {
      font-size: 11px;
      word-break: break-all;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .mock-grid {
      width: 100%;
      height: 100%;
    }
    .mock-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: grayscale(100%) opacity(0.5);
    }
    .overlay-glass {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 120px;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: #38bdf8;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(56, 189, 248, 0.3);
      border-radius: 50%;
      border-top-color: #38bdf8;
      animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ImageViewerComponent implements OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  previews: FilePreview[] = [];
  isUploaded = false;
  isUploading = false;

  constructor(private http: HttpClient) { }

  triggerFileInput() {
    if (!this.isUploading) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      
      // Cleanup old object URLs to prevent memory leaks
      this.previews.forEach(p => URL.revokeObjectURL(p.url));
      
      this.previews = fileArray.map(file => {
        return {
          file,
          url: URL.createObjectURL(file),
          isImage: file.type.startsWith('image/'),
          name: file.name
        };
      });
      
      this.isUploaded = true;
      this.uploadFiles(fileArray);
    }
  }

  private uploadFiles(files: File[]) {
    this.isUploading = true;
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    this.http.post('http://localhost:3000/api/triage/upload', formData).subscribe({
      next: (res) => {
        console.log('Upload successful, analysis started', res);
        this.isUploading = false;
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.isUploading = false;
        alert('Upload failed. Please check the console and ensure your backend/Supabase are running.');
      }
    });
  }

  ngOnDestroy() {
    this.previews.forEach(p => URL.revokeObjectURL(p.url));
  }
}
