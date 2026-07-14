import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  template: `
    <div class="flex h-screen w-screen bg-[#F0F2F9] text-[#2B3654] font-sans overflow-hidden">
      <!-- Floating Sidebar -->
      <nav class="w-[88px] h-full flex flex-col items-center py-8 gap-10 bg-transparent border-r border-white/40">
        <!-- Logo Icon -->
        <div class="w-12 h-12 bg-[#262D34] rounded-[1.25rem] flex items-center justify-center cursor-pointer shadow-lg">
          <div class="grid grid-cols-2 gap-1 w-5 h-5">
            <div class="bg-yellow-400 rounded-sm"></div>
            <div class="bg-green-400 rounded-sm"></div>
            <div class="bg-blue-400 rounded-sm"></div>
            <div class="bg-red-400 rounded-sm"></div>
          </div>
        </div>

        <!-- Nav Icons -->
        <div class="flex flex-col gap-8 mt-4 w-full items-center">
          <!-- Active Nav Item -->
          <a routerLink="/" routerLinkActive="text-[#4A83F6]" [routerLinkActiveOptions]="{exact: true}" class="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white/50 transition-colors text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
          </a>
          <!-- Users -->
          <a class="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white/50 transition-colors text-gray-400 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </a>
          <!-- Triage -->
          <a routerLink="/triage" routerLinkActive="text-[#4A83F6]" class="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white/50 transition-colors text-gray-400 cursor-pointer" title="Triage Assessment">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/></svg>
          </a>
          <!-- Scribe -->
          <a routerLink="/scribe" routerLinkActive="text-[#4A83F6]" class="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white/50 transition-colors text-gray-400 cursor-pointer" title="Scribe">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </a>
        </div>

        <div class="mt-auto flex flex-col gap-4">
          <a class="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white/50 transition-colors text-gray-400 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
          </a>
          <a class="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white/50 transition-colors text-gray-400 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </a>
        </div>
      </nav>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col h-full overflow-hidden">
        
        <!-- Top Navigation Bar -->
        <header class="w-full h-[90px] px-8 flex items-center justify-between border-b border-white/20">
          
          <!-- Logo & Search -->
          <div class="flex items-center gap-8">
            <div class="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12L12 3L18 12H6Z" fill="#FACC15"/>
                <path d="M6 12L12 21L18 12H6Z" fill="#3B82F6"/>
              </svg>
              <span class="text-xl font-bold tracking-tight text-gray-800">Medi</span>
            </div>

            <div class="relative hidden md:block">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input type="text" placeholder="Search" class="pl-10 pr-4 py-3 bg-white/60 backdrop-blur-md rounded-full w-[300px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow-sm border border-white/50 placeholder:text-gray-400">
            </div>
          </div>

          <!-- Right Nav -->
          <div class="flex items-center gap-8">
            
            <!-- Text Links -->
            <nav class="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-500">
              <a href="#" class="hover:text-gray-900 transition-colors">Feedback</a>
              <a href="#" class="hover:text-gray-900 transition-colors">Contact</a>
              <a href="#" class="hover:text-gray-900 transition-colors">Help</a>
            </nav>

            <!-- New Appointment -->
            <a routerLink="/appointment-booking" class="flex items-center gap-2 bg-[#4A83F6] hover:bg-[#3b73e5] text-white transition-colors px-4 py-2 rounded-full text-sm font-medium shadow-sm cursor-pointer">
              <div class="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
              </div>
              New Appointment
            </a>
            
            <!-- Notification -->
            <button class="w-12 h-12 bg-[#212121] text-white rounded-full flex items-center justify-center relative shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              <div class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#212121]"></div>
            </button>

            <!-- Profile -->
            <div class="flex items-center gap-3 bg-white/40 hover:bg-white/60 transition-colors cursor-pointer backdrop-blur-md border border-white/50 pl-2 pr-4 py-1.5 rounded-full shadow-sm">
              <img src="https://ui-avatars.com/api/?name=Bocchi+Rock&background=random" alt="Profile" class="w-10 h-10 rounded-full border-2 border-white shadow-sm">
              <div class="hidden md:flex flex-col">
                <span class="text-sm font-bold text-gray-800 leading-tight">Bocchi Rock</span>
                <span class="text-[10px] text-gray-500">Premium member</span>
              </div>
              <svg class="w-4 h-4 text-gray-500 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </header>

        <!-- Route Component injected here -->
        <div class="flex-1 overflow-y-auto p-4 md:p-8">
          <router-outlet></router-outlet>
        </div>

      </div>
    </div>
  `
})
export class AppComponent {
  // Logic minimal for now
}
