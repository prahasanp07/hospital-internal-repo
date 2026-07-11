import { Component, ElementRef, ViewChild, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import gsap from 'gsap';

@Component({
  selector: 'app-avatar-consult',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dashboard-container">
      <div class="avatar-card glass-panel" #avatarCard>
        
        <div class="header">
          <h2>Live Digital Human Consult</h2>
          <div class="status-badge" [class.connected]="wsConnected">
            <span class="dot"></span> {{ wsConnected ? 'Connected to GenAI' : 'Connecting...' }}
          </div>
        </div>

        <div class="video-container">
          <!-- WebRTC Video Stream Placeholder -->
          <video id="avatarStream" autoplay playsinline #videoPlayer></video>
          
          <div class="overlay-text" *ngIf="!wsConnected">
            Initializing WebRTC Stream...
          </div>
        </div>

        <div class="controls-container">
          <div class="mic-status">{{ isListening ? 'Listening...' : 'Tap to speak' }}</div>
          
          <div class="mic-wrapper">
            <div class="wave-ring ring-1" #wave1></div>
            <div class="wave-ring ring-2" #wave2></div>
            
            <button mat-fab class="mic-button" [class.active]="isListening" (click)="toggleMic()" #micButton>
              <mat-icon>{{ isListening ? 'mic' : 'mic_none' }}</mat-icon>
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 83vw;
      height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #f1f5f9;
      font-family: 'Inter', sans-serif;
    }
    
    .glass-panel {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: 24px;
      padding: 32px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    
    .avatar-card {
      width: 100%;
      max-width: 600px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    h2 {
      margin: 0;
      color: #38bdf8;
      font-weight: 600;
      font-size: 20px;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    .status-badge.connected {
      background: rgba(16, 185, 129, 0.2);
      color: #6ee7b7;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #94a3b8;
    }
    .connected .dot {
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }

    .video-container {
      width: 100%;
      aspect-ratio: 16/9;
      background: #000;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .overlay-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #94a3b8;
      font-size: 14px;
    }

    .controls-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      margin-top: 12px;
    }

    .mic-status {
      font-size: 14px;
      color: #94a3b8;
      font-weight: 500;
      height: 20px;
    }

    .mic-wrapper {
      position: relative;
      width: 80px;
      height: 80px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .wave-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 2px solid #38bdf8;
      opacity: 0;
      pointer-events: none;
    }

    .mic-button {
      background: #1e293b !important;
      color: #38bdf8 !important;
      width: 64px !important;
      height: 64px !important;
      z-index: 10;
      transition: all 0.3s ease !important;
    }

    .mic-button.active {
      background: #ef4444 !important;
      color: white !important;
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.4) !important;
    }
  `]
})
export class AvatarConsultComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('avatarCard') avatarCard!: ElementRef;
  @ViewChild('micButton', { read: ElementRef }) micButton!: ElementRef;
  @ViewChild('wave1') wave1!: ElementRef;
  @ViewChild('wave2') wave2!: ElementRef;

  isListening = false;
  wsConnected = false;
  private ws: WebSocket | null = null;
  private waveTimeline: gsap.core.Timeline | null = null;

  ngOnInit() {
    this.initWebSocket();
  }

  ngAfterViewInit() {
    gsap.from(this.avatarCard.nativeElement, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });

    this.setupWaveAnimation();
  }

  private initWebSocket() {
    this.ws = new WebSocket('ws://localhost:3000/api/live-avatar');

    this.ws.onopen = () => {
      this.wsConnected = true;
      console.log('Connected to Live Avatar WebSocket');
    };

    this.ws.onmessage = (event) => {
      console.log('Avatar gateway message:', event.data);
    };

    this.ws.onclose = () => {
      this.wsConnected = false;
      console.log('Disconnected from Live Avatar WebSocket');
    };
  }

  setupWaveAnimation() {
    this.waveTimeline = gsap.timeline({ repeat: -1, paused: true });
    
    this.waveTimeline.fromTo(this.wave1.nativeElement, 
      { scale: 1, opacity: 0.8 }, 
      { scale: 1.8, opacity: 0, duration: 1.5, ease: 'sine.out' }, 0
    );
    
    this.waveTimeline.fromTo(this.wave2.nativeElement, 
      { scale: 1, opacity: 0.8 }, 
      { scale: 1.8, opacity: 0, duration: 1.5, ease: 'sine.out' }, 0.75
    );
  }

  toggleMic() {
    this.isListening = !this.isListening;
    
    if (this.isListening) {
      this.waveTimeline?.play();
      // Start microphone recording and stream binary chunks via this.ws.send(chunk)
    } else {
      this.waveTimeline?.pause();
      gsap.to([this.wave1.nativeElement, this.wave2.nativeElement], {
        scale: 1,
        opacity: 0,
        duration: 0.3
      });
      // Stop microphone recording
    }
  }

  ngOnDestroy() {
    if (this.ws) {
      this.ws.close();
    }
    if (this.waveTimeline) {
      this.waveTimeline.kill();
    }
  }
}
