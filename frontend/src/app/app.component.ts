import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  template: `
    <div class="app-layout">
      <nav class="sidebar" #sidebar [class.collapsed]="isSidebarCollapsed">
        <div class="logo">
          <h2 *ngIf="!isSidebarCollapsed">MedGemma</h2>
          <button class="toggle-btn" (click)="toggleSidebar()">
             <span class="icon">☰</span>
          </button>
        </div>
        <ul class="nav-links">
          <li>
            <a routerLink="/triage" routerLinkActive="active" (click)="animateTransition()">
              <span class="icon" title="Triage Dashboard">🏥</span> 
              <span class="nav-text" *ngIf="!isSidebarCollapsed">Triage Dashboard</span>
            </a>
          </li>
          <li>
            <a routerLink="/scribe" routerLinkActive="active" (click)="animateTransition()">
              <span class="icon" title="EHR Scribe">📝</span> 
              <span class="nav-text" *ngIf="!isSidebarCollapsed">EHR Scribe</span>
            </a>
          </li>
          <li>
            <a routerLink="/live-avatar" routerLinkActive="active" (click)="animateTransition()">
              <span class="icon" title="Live Avatar">🧑‍⚕️</span> 
              <span class="nav-text" *ngIf="!isSidebarCollapsed">Live Avatar</span>
            </a>
          </li>
        </ul>
      </nav>
      <main class="main-content" #mainContent>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: #0f172a;
      color: #f1f5f9;
      font-family: 'Inter', sans-serif;
    }
    .sidebar {
      width: 260px;
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      z-index: 10;
      transition: width 0.3s ease;
    }
    .sidebar.collapsed {
      width: 80px;
    }
    .logo {
      padding: 24px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      min-height: 76px;
    }
    .logo h2 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: bold;
      background: linear-gradient(90deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      white-space: nowrap;
    }
    .toggle-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }
    .toggle-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #38bdf8;
    }
    .toggle-btn .icon {
      margin: 0;
    }
    .nav-links {
      list-style: none;
      padding: 16px;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .nav-links li a {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      color: #cbd5e1;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.3s ease;
      background: transparent;
      white-space: nowrap;
      overflow: hidden;
    }
    .nav-links li a:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
    }
    .nav-links li a.active {
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border-left: 3px solid #38bdf8;
    }
    .icon {
      margin-right: 12px;
      font-size: 1.2rem;
    }
    .main-content {
      flex: 1;
      position: relative;
      overflow: hidden;
    }
  `]
})
export class AppComponent implements AfterViewInit {
  title = 'frontend';
  isSidebarCollapsed = false;

  @ViewChild('mainContent') mainContent!: ElementRef;

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  ngAfterViewInit() {
    gsap.from(this.mainContent.nativeElement, {
      opacity: 0,
      x: 20,
      duration: 0.8,
      ease: 'power3.out'
    });
  }

  animateTransition() {
    gsap.fromTo(this.mainContent.nativeElement,
      { opacity: 0, scale: 0.98 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
    );
  }
}
