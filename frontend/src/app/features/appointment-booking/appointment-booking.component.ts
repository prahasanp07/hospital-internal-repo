import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  patients: number;
  avatar: string;
}

interface Appointment {
  id: string;
  title: string;
  type: 'Done' | 'Upcoming' | 'Unavailable' | 'Lunch';
  color: 'green' | 'pink' | 'blue' | 'cyan' | 'yellow' | 'striped';
  timeLabel: string;
  doctorIndex: number; // 0 to 3
  top: number; // in pixels (100px = 1 hour, 0px = 8am)
  height: number; // in pixels
  draggable: boolean;
  avatars?: string[];
}

@Component({
  selector: 'app-appointment-booking',
  standalone: true,
  imports: [CommonModule, DragDropModule, ReactiveFormsModule],
  template: `
    <div class="w-full h-full flex flex-col bg-white rounded-tl-3xl shadow-lg border border-gray-100 overflow-hidden select-none relative">
      
      <!-- Top Header -->
      <div class="flex items-center justify-between px-8 py-6 border-b border-gray-100">
        <div class="flex items-center gap-8">
          <h1 class="text-2xl font-semibold text-gray-800">My Calendar</h1>
          <div class="flex items-center gap-6 mt-1">
            <button class="text-blue-500 font-medium border-b-2 border-blue-500 pb-1">Today</button>
            <button class="text-gray-400 font-medium hover:text-gray-600 pb-1">This Week</button>
            <button class="text-gray-400 font-medium hover:text-gray-600 pb-1">This Month</button>
          </div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-gray-50/30">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-700 font-medium cursor-pointer shadow-sm">
            <svg class="text-blue-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Thu, 11 July 2024
            <svg class="w-4 h-4 text-gray-400 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
          <button class="px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 shadow-sm">Today</button>
        </div>

        <div class="text-sm text-gray-500 font-medium">
          <span class="text-gray-800 font-semibold">{{ draggableAppointments.length }}</span> total appointments
        </div>

        <div class="flex items-center gap-3">
          <div class="flex bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
            <button class="p-1.5 bg-blue-50 text-blue-500 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></button>
            <button class="p-1.5 text-gray-400 hover:text-gray-600 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></button>
          </div>
          
          <button class="flex items-center gap-2 px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-50 shadow-sm">
            <svg class="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filters
          </button>
          
          <button (click)="openModal()" class="flex items-center gap-2 px-4 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create Schedule
          </button>
        </div>
      </div>

      <!-- Calendar Grid Area -->
      <div class="flex-1 overflow-auto bg-gray-50/20 relative pb-10" id="scrollArea">
        
        <!-- Main Grid Container -->
        <div class="min-w-[900px] border-b border-gray-100 flex flex-col relative" #gridContainer>
          
          <!-- Header Row -->
          <div class="grid grid-cols-[80px_repeat(4,1fr)] w-full sticky top-0 z-30 shadow-sm border-b border-gray-100">
            <div class="p-4 border-r border-gray-100 flex flex-col justify-center items-center text-gray-500 bg-white">
              <span class="text-sm font-semibold">GMT</span>
              <span class="text-xs">+7:00</span>
            </div>

            <ng-container *ngFor="let doc of doctors">
              <div class="p-4 border-r border-gray-100 flex items-center justify-between bg-white relative">
                <div class="flex items-center gap-3">
                  <img [src]="doc.avatar" class="w-10 h-10 rounded-full">
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-gray-800">{{ doc.name }}</span>
                    <span class="text-xs text-gray-400">{{ doc.specialty }} • {{ doc.patients }} patients</span>
                  </div>
                </div>
                <button class="text-gray-400 hover:text-gray-600"><svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
              </div>
            </ng-container>
          </div>

          <!-- Time Rows and Drop Boundary (Expanded to 12 hours = 1200px) -->
          <div class="relative w-full h-[1200px]">
            <!-- Background Lines -->
            <div class="absolute inset-0 grid grid-cols-[80px_repeat(4,1fr)] pointer-events-none z-0">
              <div class="border-r border-gray-100 h-full flex flex-col bg-white/50">
                <div class="h-[100px] border-b border-gray-100 flex justify-center pt-2"><span class="text-xs font-medium text-gray-500">8am</span></div>
                <div class="h-[100px] border-b border-gray-100 flex justify-center pt-2"><span class="text-xs font-medium text-gray-500">9am</span></div>
                <div class="h-[100px] border-b border-gray-100 flex justify-center pt-2"><span class="text-xs font-medium text-gray-500">10am</span></div>
                <div class="h-[100px] border-b border-gray-100 flex justify-center pt-2"><span class="text-xs font-medium text-gray-500">11am</span></div>
                <div class="h-[100px] border-b border-gray-100 flex justify-center pt-2"><span class="text-xs font-medium text-gray-500">12pm</span></div>
                <div class="h-[100px] border-b border-gray-100 flex justify-center pt-2"><span class="text-xs font-medium text-gray-500">1pm</span></div>
                <div class="h-[100px] border-b border-gray-100 flex justify-center pt-2"><span class="text-xs font-medium text-gray-500">2pm</span></div>
                <div class="h-[100px] border-b border-gray-100 flex justify-center pt-2"><span class="text-xs font-medium text-gray-500">3pm</span></div>
                <div class="h-[100px] border-b border-gray-100 flex justify-center pt-2"><span class="text-xs font-medium text-gray-500">4pm</span></div>
                <div class="h-[100px] border-b border-gray-100 flex justify-center pt-2"><span class="text-xs font-medium text-gray-500">5pm</span></div>
                <div class="h-[100px] border-b border-gray-100 flex justify-center pt-2"><span class="text-xs font-medium text-gray-500">6pm</span></div>
                <div class="h-[100px] border-b border-gray-100 flex justify-center pt-2"><span class="text-xs font-medium text-gray-500">7pm</span></div>
              </div>
              
              <!-- Vertical column lines (12 rows each) -->
              <div class="border-r border-gray-100 h-full">
                <div *ngFor="let i of [1,2,3,4,5,6,7,8,9,10,11,12]" class="h-[100px] border-b border-gray-100 border-dashed"></div>
              </div>
              <div class="border-r border-gray-100 h-full">
                <div *ngFor="let i of [1,2,3,4,5,6,7,8,9,10,11,12]" class="h-[100px] border-b border-gray-100 border-dashed"></div>
              </div>
              <div class="border-r border-gray-100 h-full">
                <div *ngFor="let i of [1,2,3,4,5,6,7,8,9,10,11,12]" class="h-[100px] border-b border-gray-100 border-dashed"></div>
              </div>
              <div class="h-full">
                <div *ngFor="let i of [1,2,3,4,5,6,7,8,9,10,11,12]" class="h-[100px] border-b border-gray-100 border-dashed"></div>
              </div>
            </div>

            <!-- Absolute Positioning Draggable Area (covers cols 1-4) -->
            <div class="absolute left-[80px] right-0 top-0 bottom-0 z-10" #dropBoundary>
              
              <!-- Global Lunch Break Overlay (Not draggable) -->
              <div class="absolute w-full flex flex-col justify-center items-center pointer-events-none"
                   style="background: repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px); top: 400px; height: 100px;">
                <span class="font-bold text-gray-800 text-sm bg-white/80 backdrop-blur-sm px-4 py-1 rounded-full shadow-sm">Lunch Break</span>
                <span class="text-xs text-gray-500 mt-1 font-medium">12:00 PM - 01:00 PM</span>
              </div>

              <!-- Dynamic Appointments -->
              <ng-container *ngFor="let app of appointments; trackBy: trackById">
                
                <div *ngIf="app.draggable" 
                     class="absolute p-3 rounded-md shadow-sm transition-shadow cursor-grab active:cursor-grabbing border-l-4 z-10 hover:shadow-md hover:z-20 bg-white group"
                     [ngClass]="getCardClasses(app)"
                     [style.left]="'calc(' + (app.doctorIndex * 25) + '% + 8px)'"
                     [style.width]="'calc(25% - 16px)'"
                     [style.top.px]="app.top"
                     [style.height.px]="app.height"
                     cdkDrag
                     cdkDragBoundary=".calendar-boundary"
                     (cdkDragEnded)="onDragEnded($event, app)"
                     (dblclick)="editAppointment(app)">
                  
                  <div class="flex justify-between items-start pointer-events-none">
                    <span class="font-bold text-gray-800 text-sm">{{ app.title }}</span>
                    <span class="bg-white px-2 py-0.5 rounded-full text-[10px] font-semibold text-gray-600 flex items-center gap-1 border border-gray-100">
                      <div class="w-1.5 h-1.5 rounded-full" [ngClass]="getBadgeColor(app)"></div> 
                      {{ app.type }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-500 mt-1 pointer-events-none">{{ app.timeLabel }}</div>
                  
                  <!-- Edit Button overlay -->
                  <button (click)="editAppointment(app)" class="absolute top-2 right-2 p-1.5 bg-white/80 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-gray-500 hover:text-blue-500 cursor-pointer z-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  </button>
                  
                  <div class="flex -space-x-2 mt-2 pointer-events-none" *ngIf="app.avatars && app.avatars.length > 0">
                    <img *ngFor="let avatar of app.avatars" class="w-5 h-5 rounded-full border border-white" [src]="avatar">
                    <div class="w-5 h-5 rounded-full border border-white bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold">12+</div>
                  </div>
                  
                </div>

                <!-- Non-draggable block (Unavailable) -->
                <div *ngIf="!app.draggable && app.type === 'Unavailable'"
                     class="absolute rounded-md p-3 flex flex-col justify-center items-center opacity-70 pointer-events-none"
                     style="background: repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px);"
                     [style.left]="'calc(' + (app.doctorIndex * 25) + '% + 8px)'"
                     [style.width]="'calc(25% - 16px)'"
                     [style.top.px]="app.top"
                     [style.height.px]="app.height">
                  <span class="font-bold text-gray-800 text-sm">Unavailable</span>
                  <span class="text-xs text-gray-500">{{ app.timeLabel }}</span>
                </div>

              </ng-container>

            </div>
          </div>
        </div>
      </div>
      
      <!-- Create Schedule Modal -->
      <div *ngIf="isScheduleModalOpen" class="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border border-gray-100">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 class="text-lg font-semibold text-gray-800">Create Schedule</h2>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          
          <form [formGroup]="scheduleForm" (ngSubmit)="onSubmit()" class="p-6">
            
            <div *ngIf="conflictError" class="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <svg class="w-5 h-5 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{{ conflictError }}</span>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Appointment Title</label>
                <input type="text" formControlName="title" placeholder="e.g. Consultation" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                <select formControlName="doctorIndex" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                  <option *ngFor="let doc of doctors; let i = index" [value]="i">{{ doc.name }} ({{ doc.specialty }})</option>
                </select>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input type="time" formControlName="startTime" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input type="time" formControlName="endTime" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Card Color</label>
                <select formControlName="color" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                  <option value="blue">Blue (Operation)</option>
                  <option value="green">Green (Checkup Done)</option>
                  <option value="pink">Pink (Checkup Upcoming)</option>
                  <option value="cyan">Cyan</option>
                  <option value="yellow">Yellow</option>
                </select>
              </div>
            </div>

            <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" (click)="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" [disabled]="scheduleForm.invalid" class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Save Schedule</button>
            </div>
          </form>
        </div>
      </div>
      
    </div>
    
    <!-- We apply this class purely for DragDrop Boundary targeting -->
    <div class="hidden calendar-boundary"></div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      padding-top: 1rem;
      padding-right: 1rem;
    }
    
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 6px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
      opacity: 0.9;
      z-index: 100 !important;
    }

    .cdk-drag-placeholder {
      opacity: 0.3;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    
    .animate-fade-in-up {
      animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(15px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `]
})
export class AppointmentBookingComponent implements AfterViewInit {
  @ViewChild('dropBoundary') dropBoundaryRef!: ElementRef;
  
  // Snap settings
  columnCount = 4;
  rowHeight = 100; // 100px per hour
  snapInterval = 50; // 50px = 30 minutes
  maxTop = 1200; // 12 hours * 100px

  // Modal State
  isScheduleModalOpen = false;
  editingAppId: string | null = null;
  conflictError: string | null = null;
  scheduleForm: FormGroup;

  doctors: Doctor[] = [
    { id: 'd1', name: 'Dr. Esther Howard', specialty: 'Dentist', patients: 28, avatar: 'https://ui-avatars.com/api/?name=Esther+Howard&background=random' },
    { id: 'd2', name: 'Dr. Leslie Alexander', specialty: 'Neurology', patients: 12, avatar: 'https://ui-avatars.com/api/?name=Leslie+Alexander&background=random' },
    { id: 'd3', name: 'Dr. Guy Hawkins', specialty: 'Cardiology', patients: 28, avatar: 'https://ui-avatars.com/api/?name=Guy+Hawkins&background=random' },
    { id: 'd4', name: 'Dr. Cody Fisher', specialty: 'Nephrology', patients: 28, avatar: 'https://ui-avatars.com/api/?name=Cody+Fisher&background=random' }
  ];

  appointments: Appointment[] = [
    // Dr Esther
    { id: 'a1', title: 'Medical Checkup', type: 'Done', color: 'green', timeLabel: '08:00 AM - 09:00 AM', doctorIndex: 0, top: 0, height: 100, draggable: true, avatars: ['https://ui-avatars.com/api/?name=A&background=random'] },
    { id: 'a2', title: 'Medical Checkup', type: 'Upcoming', color: 'pink', timeLabel: '01:30 PM - 02:30 PM', doctorIndex: 0, top: 550, height: 100, draggable: true, avatars: ['https://ui-avatars.com/api/?name=C&background=random'] },
    
    // Dr Leslie
    { id: 'a3', title: 'Operation', type: 'Upcoming', color: 'blue', timeLabel: '10:30 AM - 11:30 AM', doctorIndex: 1, top: 250, height: 100, draggable: true, avatars: ['https://ui-avatars.com/api/?name=E&background=random'] },
    
    // Dr Guy
    { id: 'a4', title: 'Medical Checkup', type: 'Done', color: 'pink', timeLabel: '08:00 AM - 09:00 AM', doctorIndex: 2, top: 0, height: 100, draggable: true, avatars: ['https://ui-avatars.com/api/?name=G&background=random'] },
    { id: 'a5', title: 'Operation', type: 'Upcoming', color: 'cyan', timeLabel: '01:30 PM - 03:00 PM', doctorIndex: 2, top: 550, height: 150, draggable: true, avatars: ['https://ui-avatars.com/api/?name=I&background=random'] },
    
    // Dr Cody
    { id: 'a6', title: 'Unavailable', type: 'Unavailable', color: 'striped', timeLabel: '09:00 AM - 10:00 AM', doctorIndex: 3, top: 100, height: 100, draggable: false },
    { id: 'a7', title: 'Medical Checkup', type: 'Upcoming', color: 'yellow', timeLabel: '10:30 AM - 11:30 AM', doctorIndex: 3, top: 250, height: 100, draggable: true, avatars: ['https://ui-avatars.com/api/?name=J&background=random'] },
  ];

  constructor(private fb: FormBuilder) {
    this.scheduleForm = this.fb.group({
      title: ['Consultation', Validators.required],
      doctorIndex: [0, Validators.required],
      startTime: ['10:00', Validators.required],
      endTime: ['11:00', Validators.required],
      color: ['blue', Validators.required]
    });
  }

  get draggableAppointments() {
    return this.appointments.filter(a => a.draggable);
  }

  ngAfterViewInit() {
    // We add the boundary class to the drop container so cards can't be dragged entirely out of view.
    this.dropBoundaryRef.nativeElement.classList.add('calendar-boundary');
  }

  trackById(index: number, item: Appointment) {
    return item.id;
  }

  getCardClasses(app: Appointment): string {
    const map: Record<string, string> = {
      'green': 'bg-green-50 border-green-500',
      'pink': 'bg-pink-50 border-pink-500',
      'blue': 'bg-blue-50 border-blue-500',
      'cyan': 'bg-cyan-50 border-cyan-400',
      'yellow': 'bg-yellow-50 border-yellow-500',
    };
    return map[app.color] || 'bg-gray-50 border-gray-300';
  }

  getBadgeColor(app: Appointment): string {
    return app.type === 'Done' ? 'bg-green-500' : 'bg-blue-500';
  }

  // --- Modal Logic ---

  pxToTimeStr(px: number): string {
    const baseHour = 8;
    const totalMinutes = (px / this.rowHeight) * 60;
    const hourOffset = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    
    const hour24 = baseHour + hourOffset;
    
    const hStr = hour24 < 10 ? '0' + hour24 : '' + hour24;
    const mStr = minutes === 0 ? '00' : (minutes < 10 ? '0' + minutes : '' + minutes);
    
    return `${hStr}:${mStr}`;
  }

  editAppointment(app: Appointment) {
    this.conflictError = null;
    this.editingAppId = app.id;
    
    const startTime = this.pxToTimeStr(app.top);
    const endTime = this.pxToTimeStr(app.top + app.height);
    
    this.scheduleForm.patchValue({
      title: app.title,
      doctorIndex: app.doctorIndex,
      startTime: startTime,
      endTime: endTime,
      color: app.color
    });
    
    this.isScheduleModalOpen = true;
  }

  openModal() {
    this.conflictError = null;
    this.editingAppId = null;
    this.scheduleForm.patchValue({
      title: 'Consultation',
      doctorIndex: 0,
      startTime: '10:00',
      endTime: '11:00',
      color: 'blue'
    });
    this.isScheduleModalOpen = true;
  }

  closeModal() {
    this.isScheduleModalOpen = false;
  }

  parseTimeStrToPx(timeStr: string): number {
    // timeStr format "HH:mm" (24-hour)
    const [hours, minutes] = timeStr.split(':').map(Number);
    // Base is 8:00 AM (8 hours)
    const baseHour = 8;
    // Calculate difference in hours
    const hourDiff = hours - baseHour;
    const minDiff = minutes / 60;
    
    // Each hour = 100px
    return (hourDiff + minDiff) * this.rowHeight;
  }

  checkConflict(docIndex: number, newTop: number, newHeight: number, excludeAppId?: string): boolean {
    const newBottom = newTop + newHeight;
    
    // Check against global lunch break (12:00 PM - 01:00 PM) -> 400px to 500px
    const lunchTop = 400;
    const lunchBottom = 500;
    if (newTop < lunchBottom && newBottom > lunchTop) {
      return true;
    }

    return this.appointments.some(app => {
      if (app.id === excludeAppId) return false;
      if (app.doctorIndex !== docIndex) return false;
      
      const existingTop = app.top;
      const existingBottom = app.top + app.height;
      
      // Conflict if they overlap vertically
      return (newTop < existingBottom) && (newBottom > existingTop);
    });
  }

  onSubmit() {
    if (this.scheduleForm.invalid) return;

    this.conflictError = null;
    
    const formVals = this.scheduleForm.value;
    const docIndex = Number(formVals.doctorIndex);
    
    const startPx = this.parseTimeStrToPx(formVals.startTime);
    const endPx = this.parseTimeStrToPx(formVals.endTime);
    
    if (endPx <= startPx) {
      this.conflictError = 'End time must be after start time.';
      return;
    }
    
    if (startPx < 0 || endPx > this.maxTop) {
      this.conflictError = 'Time must be between 08:00 AM and 08:00 PM.';
      return;
    }

    const heightPx = endPx - startPx;

    const hasConflict = this.checkConflict(docIndex, startPx, heightPx, this.editingAppId || undefined);
    if (hasConflict) {
      this.conflictError = 'Conflict detected! This time slot overlaps with an existing appointment or the lunch break.';
      return;
    }

    if (this.editingAppId) {
      // Update existing
      const existingApp = this.appointments.find(a => a.id === this.editingAppId);
      if (existingApp) {
        existingApp.title = formVals.title;
        existingApp.color = formVals.color;
        existingApp.doctorIndex = docIndex;
        existingApp.top = startPx;
        existingApp.height = heightPx;
        existingApp.timeLabel = this.generateTimeLabel(startPx, heightPx);
      }
    } else {
      // Success! Create the new appointment
      const newApp: Appointment = {
        id: 'app_' + Math.random().toString(36).substr(2, 9),
        title: formVals.title,
        type: 'Upcoming',
        color: formVals.color,
        timeLabel: this.generateTimeLabel(startPx, heightPx),
        doctorIndex: docIndex,
        top: startPx,
        height: heightPx,
        draggable: true,
        avatars: ['https://ui-avatars.com/api/?name=New+Patient&background=random']
      };
      this.appointments.push(newApp);
    }

    this.closeModal();
  }

  // --- Drag and Drop Logic ---

  onDragEnded(event: CdkDragEnd, app: Appointment) {
    const dropBoundaryElement = this.dropBoundaryRef.nativeElement as HTMLElement;
    const boundaryWidth = dropBoundaryElement.clientWidth;
    const columnWidth = boundaryWidth / this.columnCount;
    
    // Total distance moved in pixels
    const movedX = event.distance.x;
    const movedY = event.distance.y;

    // Calculate how many columns we shifted (rounding to nearest column)
    const columnsShifted = Math.round(movedX / columnWidth);
    let newDoctorIndex = app.doctorIndex + columnsShifted;
    
    // Clamp to valid doctor columns
    if (newDoctorIndex < 0) newDoctorIndex = 0;
    if (newDoctorIndex > this.columnCount - 1) newDoctorIndex = this.columnCount - 1;

    // Calculate vertical snapping (snapping to nearest 50px = 30 mins interval)
    const rawNewTop = app.top + movedY;
    let snappedTop = Math.round(rawNewTop / this.snapInterval) * this.snapInterval;

    // Clamp top between 0 and 1200px (grid bounds) minus the height of the card
    const maxTopBoundary = this.maxTop - app.height;
    if (snappedTop < 0) snappedTop = 0;
    if (snappedTop > maxTopBoundary) snappedTop = maxTopBoundary;

    // --- Check for Drag Conflicts before applying ---
    const hasConflict = this.checkConflict(newDoctorIndex, snappedTop, app.height, app.id);
    
    if (hasConflict) {
      // Revert drag instantly by just resetting the drag transform and not updating state
      event.source._dragRef.reset();
      // Optional: we could show a toast notification here
      return; 
    }

    // Apply the new state
    app.doctorIndex = newDoctorIndex;
    app.top = snappedTop;
    
    // Update the time label dynamically based on the snapped top
    app.timeLabel = this.generateTimeLabel(app.top, app.height);

    // CRITICAL: Reset the drag transform so our absolute positioning (top/left) takes over!
    event.source._dragRef.reset();
  }

  generateTimeLabel(top: number, height: number): string {
    const formatTime = (px: number) => {
      // 0px = 8:00 AM
      const baseHour = 8;
      const totalMinutes = (px / this.rowHeight) * 60;
      const hourOffset = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      let hour24 = baseHour + hourOffset;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      
      let hour12 = hour24 % 12;
      if (hour12 === 0) hour12 = 12;
      
      const minStr = minutes === 0 ? '00' : '30';
      const hourStr = hour12 < 10 ? '0' + hour12 : '' + hour12;
      
      return `${hourStr}:${minStr} ${ampm}`;
    };

    return `${formatTime(top)} - ${formatTime(top + height)}`;
  }
}
