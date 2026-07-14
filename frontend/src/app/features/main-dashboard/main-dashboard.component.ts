import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 pb-10">
      
      <!-- LEFT COLUMN -->
      <div class="flex flex-col gap-8">
        
        <!-- HEART HEALTH OVERVIEW (Top Left) -->
        <div class="glass-panel min-h-[420px] p-8 flex flex-col justify-between bg-gradient-to-br from-[#c4d6f9]/50 to-[#92aef3]/30">
          <div class="flex justify-between items-start z-10 relative">
            <h2 class="text-3xl font-bold text-gray-800 tracking-tight">Heart health Overview</h2>
            <div class="glass-pill px-4 py-1 text-sm font-semibold text-gray-800">Sp02 97%</div>
          </div>

          <!-- Central Graphic Area (Placeholder for 3D Anatomy) -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-90">
            <!-- Simulated glowing heart graphic -->
            <div class="w-[200px] h-[300px] bg-gradient-to-b from-blue-400/20 to-transparent rounded-full blur-3xl absolute"></div>
            <img src="https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=400&h=600" alt="Anatomy" class="h-[90%] object-contain mix-blend-multiply opacity-50 drop-shadow-2xl">
          </div>

          <!-- Floating Widgets -->
          <div class="grid grid-cols-2 gap-4 mt-auto z-10 relative">
            <!-- Left Widget -->
            <div class="glass-panel p-4 max-w-[280px] flex flex-col gap-3">
              <div class="flex items-center gap-3">
                <img src="https://ui-avatars.com/api/?name=User&background=random" class="w-12 h-12 rounded-xl object-cover">
                <span class="text-sm font-semibold leading-tight text-gray-700">Not Enough<br>information<br>about sleep</span>
              </div>
              <div class="flex gap-2 mt-2">
                <span class="glass-pill px-3 py-1 text-xs">Quality</span>
                <span class="glass-pill px-3 py-1 text-xs">Time</span>
              </div>
              <p class="text-[10px] text-gray-500 leading-relaxed mt-2">The secret to a healthy heart<br>Engaging in moderate exercise, such as walking or cycling, for at least 30 minutes a day strengthens the cardiovascular system.</p>
              <button class="glass-button px-4 py-1.5 text-xs w-max mt-2">Add info +</button>
            </div>
            
            <!-- Right Widget -->
            <div class="glass-panel p-4 flex flex-col justify-center items-start self-end ml-auto">
              <div class="flex items-center gap-2 mb-2">
                <svg width="60" height="20" viewBox="0 0 60 20" fill="none" stroke="#FA4F61" stroke-width="1.5"><path d="M0 10h10l5-8 10 16 5-8h30"/></svg>
                <div class="w-3 h-3 bg-[#FA4F61] rounded-full"></div>
              </div>
              <p class="text-sm font-semibold text-gray-800">The Value is<br>Working perfectly!</p>
              <a href="#" class="text-xs text-blue-500 hover:underline mt-1">See more</a>
            </div>
          </div>
        </div>

        <!-- PATIENT ANALYTICS (Bottom Left) -->
        <div class="glass-panel-blue min-h-[360px] p-8 flex flex-col bg-gradient-to-br from-[#4b84f3] to-[#366ada] text-white overflow-visible">
          <h2 class="text-2xl font-semibold mb-6">Patient Analytics</h2>
          
          <!-- Metric Pills -->
          <div class="flex flex-wrap gap-4 mb-8">
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-3 px-5 flex items-center gap-4 border border-white/20">
              <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">📋</div>
              <div class="flex flex-col"><span class="text-sm font-medium">Today's Discharge List</span><span class="text-xs text-blue-100">16 person</span></div>
            </div>
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-3 px-5 flex items-center gap-4 border border-white/20">
              <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">👤</div>
              <div class="flex flex-col"><span class="text-sm font-medium">New patients</span><span class="text-xs text-blue-100">125 for the month</span></div>
            </div>
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-3 px-5 flex items-center gap-4 border border-white/20">
              <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">👥</div>
              <div class="flex flex-col"><span class="text-sm font-medium">Total Patients</span><span class="text-xs text-blue-100">2000+</span></div>
            </div>
          </div>

          <!-- Activity Chart -->
          <div class="mt-auto flex flex-col">
            <div class="flex justify-between items-end mb-4 z-10 relative">
              <h3 class="text-xl font-medium">Activity</h3>
              <div class="flex gap-1 bg-white/10 p-1 rounded-full border border-white/20">
                <button class="px-4 py-1 text-xs rounded-full bg-white/20">Week</button>
                <button class="px-4 py-1 text-xs rounded-full hover:bg-white/10">Month</button>
                <button class="px-4 py-1 text-xs rounded-full hover:bg-white/10">Year</button>
              </div>
            </div>
            
            <!-- Simulated Wave Chart -->
            <div class="relative w-full h-[120px] flex items-end justify-between px-4 z-10">
              <svg class="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2">
                <path d="M0 80 Q 15 20, 30 50 T 60 70 T 90 20 L 100 20" />
                <circle cx="60" cy="70" r="3" fill="#FA4F61" stroke="white" stroke-width="2" />
              </svg>
              <!-- Bar columns -->
              <div class="w-8 h-[60%] bg-white/10 rounded-t-full"></div>
              <div class="w-8 h-[80%] bg-white/10 rounded-t-full"></div>
              <div class="w-8 h-[40%] bg-white/10 rounded-t-full"></div>
              <div class="w-8 h-[90%] bg-white/10 rounded-t-full relative"><span class="absolute -top-6 text-[10px] w-full text-center">High</span></div>
              <div class="w-8 h-[50%] bg-white/10 rounded-t-full"></div>
              <div class="w-8 h-[70%] bg-white/10 rounded-t-full"></div>
              <div class="w-8 h-[30%] bg-white/10 rounded-t-full"></div>
            </div>
            <div class="flex justify-between px-5 text-xs text-blue-100 mt-2 z-10 relative">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
          <!-- Decorative abstract blur -->
          <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-white/20 blur-3xl rounded-full pointer-events-none"></div>
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div class="flex flex-col gap-8 h-full">
        
        <!-- CONDITION GUIDES (Top Right) -->
        <div class="glass-panel-blue flex-1 min-h-[400px] p-6 flex flex-col bg-[#8caef5]/80 text-white relative">
          <div class="flex justify-between items-center mb-6 z-10">
            <h3 class="text-lg font-medium">Condition Guides</h3>
            <button class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">...</button>
          </div>
          
          <div class="flex-1 relative flex items-center justify-center">
            <!-- Simulated Skeleton 3D Graphic -->
            <img src="https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=200&h=400" alt="Skeleton" class="h-[250px] object-contain mix-blend-multiply opacity-60">
            
            <div class="absolute top-10 left-4 glass-pill px-3 py-1 text-xs border border-white/30"><div class="w-1.5 h-1.5 bg-white rounded-full mr-2"></div> Chest</div>
            
            <div class="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
              <span class="text-xs text-blue-100 mb-1">X-ray</span>
              <span class="text-2xl font-light">3<span class="text-sm">/4</span></span>
            </div>
          </div>
          
          <button class="mt-auto w-full py-3 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium z-10">
            Track My Mood +
          </button>
        </div>

        <!-- DOCTORS & HOSPITALS (Bottom Right) -->
        <div class="glass-panel p-6 flex flex-col gap-6 bg-gradient-to-br from-[#8baef5]/40 to-transparent">
          
          <!-- Doctors -->
          <div>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-[#2B3654] font-medium">Choose your<br>personal doctor</h3>
              <button class="glass-button px-3 py-1 text-xs text-white bg-[#8baef5] border border-white/30">See everyone +</button>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=100&h=100&q=80" class="w-full aspect-square rounded-2xl object-cover shadow-sm">
              <img src="https://images.unsplash.com/photo-1594824432258-2ebbc05b2259?auto=format&fit=crop&w=100&h=100&q=80" class="w-full aspect-square rounded-2xl object-cover shadow-sm">
              <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=100&h=100&q=80" class="w-full aspect-square rounded-2xl object-cover shadow-sm">
            </div>
            <div class="flex justify-center gap-1 mt-3">
              <div class="w-1.5 h-1.5 bg-[#4A83F6] rounded-full"></div>
              <div class="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
              <div class="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
            </div>
          </div>

          <!-- Hospitals -->
          <div>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-[#2B3654] font-medium">Choose your<br>Hospital</h3>
              <button class="glass-button px-3 py-1 text-xs text-white bg-[#8baef5] border border-white/30">See All +</button>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=150&h=100&q=80" class="w-full h-[80px] rounded-2xl object-cover shadow-sm">
              <img src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=150&h=100&q=80" class="w-full h-[80px] rounded-2xl object-cover shadow-sm">
            </div>
          </div>

        </div>
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
export class MainDashboardComponent { }
