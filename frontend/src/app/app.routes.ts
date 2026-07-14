import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./features/main-dashboard/main-dashboard.component').then(m => m.MainDashboardComponent) 
  },
  { 
    path: 'triage', 
    loadComponent: () => import('./features/triage-dashboard/triage-dashboard.component').then(m => m.TriageDashboardComponent) 
  },
  { 
    path: 'scribe', 
    loadComponent: () => import('./features/scribe-dashboard/scribe-dashboard.component').then(m => m.ScribeDashboardComponent) 
  },
  { 
    path: 'live-avatar', 
    loadComponent: () => import('./features/avatar-consult/avatar-consult.component').then(m => m.AvatarConsultComponent) 
  },
  {
    path: 'appointment-booking',
    loadComponent: () => import('./features/appointment-booking/appointment-booking.component').then(m => m.AppointmentBookingComponent)
  }
];
