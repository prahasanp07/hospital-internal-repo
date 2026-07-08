import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-image-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="image-viewport" (click)="triggerFileInput()">
      <img [src]="imagePreview" alt="Medical Image" [class.mock-image]="!isUploaded" />
      <div class="overlay-glass">
        <div class="upload-content">
          <svg *ngIf="!isUploading" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <div *ngIf="isUploading" class="spinner"></div>
          <span>{{ isUploading ? 'Uploading & Analyzing...' : (isUploaded ? 'Upload Another Image' : 'Click to Upload Diagnostic Image') }}</span>
        </div>
      </div>
      <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/png, image/jpeg" style="display: none;" />
    </div>
  `,
  styles: [`
    .image-viewport {
      position: relative;
      width: 100%;
      height: 100%;
      max-width: 400px;
      max-height: 600px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .image-viewport:hover {
      transform: translateY(-4px);
      box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.6);
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: filter 0.3s ease;
    }
    img.mock-image {
      filter: grayscale(100%) opacity(0.5);
    }
    .overlay-glass {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 120px;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
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
export class ImageViewerComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  imagePreview: string | ArrayBuffer | null = 'https://via.placeholder.com/600x800/0f172a/f1f5f9?text=Medical+Imagery+Mock';
  isUploaded = false;
  isUploading = false;

  constructor(private http: HttpClient) { }

  triggerFileInput() {
    if (!this.isUploading) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Local preview
      const reader = new FileReader();
      reader.onload = e => {
        this.imagePreview = e.target?.result || null;
        this.isUploaded = true;
      };
      reader.readAsDataURL(file);

      // Upload to backend
      this.uploadImage(file);
    }
  }

  private uploadImage(file: File) {
    this.isUploading = true;
    const formData = new FormData();
    formData.append('image', file);

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
}
