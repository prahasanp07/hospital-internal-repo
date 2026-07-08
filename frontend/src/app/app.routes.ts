import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/triage', pathMatch: 'full' },
  { 
    path: 'triage', 
    loadComponent: () => import('./features/triage-dashboard/triage-dashboard.component').then(m => m.TriageDashboardComponent) 
  },
  { 
    path: 'scribe', 
    loadComponent: () => import('./features/scribe-dashboard/scribe-dashboard.component').then(m => m.ScribeDashboardComponent) 
  }
];
