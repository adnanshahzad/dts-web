import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, Notification } from '../../services/api.service';

interface User {
  _id: string;
  email: string;
  firstname: string;
  lastname: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="bg-white shadow-lg border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and Brand -->
          <div class="flex items-center">
            <button (click)="goHome()" class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">DTS</span>
              </div>
              <span class="text-xl font-bold text-gray-900">DailyTherapySpa</span>
            </button>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-8">
            <ng-container *ngIf="isActiveRoute('/'); else appLinks">
              <button (click)="scrollTo('about')" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">About us</button>
              <button (click)="goToSalon()" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Salon</button>
              <button (click)="goToSpa()" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Spa</button>
              <button (click)="scrollTo('products')" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Products</button>
              <button (click)="scrollTo('why')" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Why us</button>
              <button (click)="scrollTo('contact')" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Contact us</button>
            </ng-container>
            <ng-template #appLinks>
              <button (click)="scrollTo('about')" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">About us</button>
              <button (click)="goToSalon()" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200" [class]="isActiveRoute('/services') && isCategoryActive('salon') ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900'">Salon</button>
              <button (click)="goToSpa()" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200" [class]="isActiveRoute('/services') && isCategoryActive('spa') ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900'">Spa</button>
              <button (click)="scrollTo('products')" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Products</button>
              <button (click)="scrollTo('why')" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Why us</button>
              <button (click)="scrollTo('contact')" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Contact us</button>
            </ng-template>
          </div>

          <!-- User Actions -->
          <div class="flex items-center space-x-4">
            <div *ngIf="!isAuthenticated()" class="flex items-center space-x-2">
              <button (click)="goToLogin()" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                Sign In
              </button>
              <button (click)="goToRegister()" class="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                Sign Up
              </button>
            </div>

            <!-- Notifications -->
            <div *ngIf="isAuthenticated()" class="relative" #notificationContainer>
              <button (click)="toggleNotificationMenu()" class="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                <span *ngIf="getUnreadCount() > 0" class="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-[18px] h-[18px]">
                  {{ getUnreadCount() > 9 ? '9+' : getUnreadCount() }}
                </span>
              </button>
              
              <!-- Notifications Dropdown -->
              <div *ngIf="showNotificationMenu" class="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 max-h-96 overflow-auto">
                <div class="py-1" role="menu" aria-orientation="vertical">
                  <!-- Header -->
                  <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <h3 class="text-sm font-semibold text-gray-900">Notifications</h3>
                    <button *ngIf="getUnreadCount() > 0" (click)="markAllAsRead()" class="text-xs text-primary-600 hover:text-primary-700">Mark all as read</button>
                  </div>
                  
                  <!-- Notifications List -->
                  <div *ngIf="notifications.length === 0" class="px-4 py-8 text-center">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p class="mt-2 text-sm text-gray-500">No notifications</p>
                  </div>
                  
                  <div *ngFor="let notification of notifications" 
                       (click)="handleNotificationClick(notification)"
                       class="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                       [class.bg-primary-50]="!notification.read"
                       role="menuitem">
                    <div class="flex items-start space-x-3">
                      <div [class]="getNotificationIconClass(notification.type)" class="flex-shrink-0 mt-0.5">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path *ngIf="notification.type === 'booking_accepted'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          <path *ngIf="notification.type === 'booking_started'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          <path *ngIf="notification.type === 'booking_completed'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          <path *ngIf="notification.type === 'booking_cancelled'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                        <p class="text-sm text-gray-500 mt-1">{{ notification.message }}</p>
                        <p class="text-xs text-gray-400 mt-1">{{ getTimeAgo(notification.createdAt) }}</p>
                      </div>
                      <div *ngIf="!notification.read" class="flex-shrink-0">
                        <div class="h-2 w-2 rounded-full bg-primary-600"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="isAuthenticated()" class="relative" #userMenuContainer>
              <button (click)="toggleUserMenu()" class="flex items-center space-x-2 focus:outline-none">
                <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span class="text-primary-600 font-medium text-sm">
                    {{ getInitials() }}
                  </span>
                </div>
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Dropdown Menu -->
              <div *ngIf="showUserMenu" class="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div class="py-1" role="menu" aria-orientation="vertical">
                  <!-- User Info -->
                  <div class="px-4 py-3 border-b border-gray-200">
                    <p class="text-sm font-medium text-gray-900">{{ currentUser?.firstname }} {{ currentUser?.lastname }}</p>
                    <p class="text-sm text-gray-500 truncate">{{ currentUser?.email }}</p>
                  </div>
                  
                  <!-- Profile -->
                  <button (click)="goToProfile(); closeUserMenu()" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2" role="menuitem">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profile</span>
                  </button>
                  
                  <!-- My Bookings -->
                  <button (click)="goToMyBookings(); closeUserMenu()" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2" role="menuitem">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>My Bookings</span>
                  </button>
                  
                  <!-- Logout -->
                  <button (click)="logout(); closeUserMenu()" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2" role="menuitem">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden">
            <button (click)="toggleMobileMenu()" class="text-gray-600 hover:text-gray-900">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile menu -->
        <div *ngIf="showMobileMenu" class="md:hidden border-t border-gray-200 py-4">
          <div class="space-y-2">
            <ng-container *ngIf="isActiveRoute('/'); else mobileAppLinks">
              <button (click)="scrollTo('about'); toggleMobileMenu()" class="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200">About us</button>
              <button (click)="goToSalon(); toggleMobileMenu()" class="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200">Salon</button>
              <button (click)="goToSpa(); toggleMobileMenu()" class="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200">Spa</button>
              <button (click)="scrollTo('products'); toggleMobileMenu()" class="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200">Products</button>
              <button (click)="scrollTo('why'); toggleMobileMenu()" class="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200">Why us</button>
              <button (click)="scrollTo('contact'); toggleMobileMenu()" class="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200">Contact us</button>
              <button (click)="goToMyBookings(); toggleMobileMenu()" class="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200" [class]="isActiveRoute('/my-bookings') ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'" *ngIf="isAuthenticated()">My Bookings</button>
            </ng-container>
            <ng-template #mobileAppLinks>
              <button (click)="goHome(); toggleMobileMenu()" class="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200" [class]="isActiveRoute('/') ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'">Home</button>
              <button (click)="scrollTo('about'); toggleMobileMenu()" class="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200">About us</button>
              <button (click)="goToServices(); toggleMobileMenu()" class="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200" [class]="isActiveRoute('/services') ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'">Services</button>
              <button (click)="goToSalon(); toggleMobileMenu()" class="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200" [class]="isActiveRoute('/services') && isCategoryActive('salon') ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'">Salon</button>
              <button (click)="goToSpa(); toggleMobileMenu()" class="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200" [class]="isActiveRoute('/services') && isCategoryActive('spa') ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'">Spa</button>
              <button (click)="scrollTo('products'); toggleMobileMenu()" class="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200">Products</button>
              <button (click)="scrollTo('why'); toggleMobileMenu()" class="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200">Why us</button>
              <button (click)="scrollTo('contact'); toggleMobileMenu()" class="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200">Contact us</button>
              <button (click)="goToMyBookings(); toggleMobileMenu()" class="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200" [class]="isActiveRoute('/my-bookings') ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'" *ngIf="isAuthenticated()">My Bookings</button>
            </ng-template>

            <div *ngIf="!isAuthenticated()" class="pt-4 border-t border-gray-200 space-y-2">
              <button (click)="goToLogin(); toggleMobileMenu()" class="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200">
                Sign In
              </button>
              <button (click)="goToRegister(); toggleMobileMenu()" class="block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-primary-600 hover:bg-primary-700 text-white">
                Sign Up
              </button>
            </div>

            <div *ngIf="isAuthenticated()" class="pt-4 border-t border-gray-200">
              <div class="flex items-center space-x-2 mb-2">
                <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span class="text-primary-600 font-medium text-sm">
                    {{ getInitials() }}
                  </span>
                </div>
                <span class="text-sm font-medium text-gray-700">
                  {{ currentUser?.firstname }} {{ currentUser?.lastname }}
                </span>
              </div>
              <button (click)="logout(); toggleMobileMenu()" class="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class NavigationComponent implements OnInit, OnDestroy {
  @ViewChild('userMenuContainer') userMenuContainer!: ElementRef;
  @ViewChild('notificationContainer') notificationContainer!: ElementRef;
  currentUser: User | null = null;
  showMobileMenu = false;
  showUserMenu = false;
  showNotificationMenu = false;
  notifications: Notification[] = [];
  private notificationInterval?: any;
  private profileUpdateHandler = () => this.handleProfileUpdate();
  private loginHandler = () => this.handleLogin();
  private storageChangeHandler = (event: StorageEvent) => this.handleStorageChange(event);

  constructor(
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserFromStorage();
    
    // If authenticated but no user data, try to fetch it
    if (this.isAuthenticated() && !this.currentUser) {
      this.fetchUserData();
    }
    
    if (this.isAuthenticated()) {
      this.loadNotifications();
      // Poll for new notifications every 30 seconds
      this.notificationInterval = setInterval(() => {
        if (this.isAuthenticated()) {
          this.loadNotifications();
        }
      }, 30000);
    }
    
    // Listen for profile updates to refresh user data
    window.addEventListener('userProfileUpdated', this.profileUpdateHandler);
    
    // Listen for login events (when user logs in on another component)
    window.addEventListener('userLoggedIn', this.loginHandler);
    
    // Listen for storage changes (when localStorage is updated from another tab/component)
    window.addEventListener('storage', this.storageChangeHandler);
  }

  ngOnDestroy(): void {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
    }
    // Remove event listeners
    window.removeEventListener('userProfileUpdated', this.profileUpdateHandler);
    window.removeEventListener('userLoggedIn', this.loginHandler);
    window.removeEventListener('storage', this.storageChangeHandler);
  }

  private handleProfileUpdate(): void {
    // Reload user data from localStorage after profile update
    this.loadUserFromStorage();
    // Force change detection to update the UI
    this.cdr.detectChanges();
  }

  private handleLogin(): void {
    // Reload user data when login event is fired
    this.loadUserFromStorage();
    this.cdr.detectChanges();
  }

  private handleStorageChange(event: StorageEvent): void {
    // Reload user data when localStorage changes (from another tab or component)
    if (event.key === 'current_user') {
      this.loadUserFromStorage();
      this.cdr.detectChanges();
    }
  }

  private fetchUserData(): void {
    // Fetch user data from API if not in localStorage
    this.apiService.getCustomerProfile().subscribe({
      next: (response: any) => {
        if (response.user) {
          const userData = {
            _id: response.user._id,
            email: response.user.email,
            firstname: response.user.firstname,
            lastname: response.user.lastname,
            role: response.user.role,
            isActive: true,
            createdAt: '',
            updatedAt: ''
          };
          localStorage.setItem('current_user', JSON.stringify(userData));
          this.currentUser = userData;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        // If customer profile doesn't exist, try to get user profile
        // This might be needed for non-customer users
        console.log('Could not fetch user profile');
      }
    });
  }

  private loadUserFromStorage(): void {
    const user = localStorage.getItem('current_user');
    if (user) {
      try {
        this.currentUser = JSON.parse(user);
        this.cdr.detectChanges();
      } catch (error) {
        this.clearAuthData();
      }
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getInitials(): string {
    if (!this.currentUser) return 'U';
    return `${this.currentUser.firstname.charAt(0)}${this.currentUser.lastname.charAt(0)}`.toUpperCase();
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  goToServices(): void {
    this.router.navigate(['/services']);
  }

  goToSalon(): void {
    this.router.navigate(['/services', 'salon']);
  }

  goToSpa(): void {
    this.router.navigate(['/services', 'spa']);
  }

  isCategoryActive(category: string): boolean {
    const currentUrl = this.router.url;
    // Check if URL is /services/:category and category matches
    return currentUrl === `/services/${category}`;
  }

  goToMyBookings(): void {
    this.router.navigate(['/my-bookings']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  logout(): void {
    this.clearAuthData();
    this.currentUser = null;
    this.router.navigate(['/']);
  }

  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.showUserMenu && this.userMenuContainer) {
      const clickedInside = this.userMenuContainer.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.showUserMenu = false;
      }
    }
    if (this.showNotificationMenu && this.notificationContainer) {
      const clickedInside = this.notificationContainer.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.showNotificationMenu = false;
      }
    }
  }

  toggleNotificationMenu(): void {
    this.showNotificationMenu = !this.showNotificationMenu;
    if (this.showNotificationMenu) {
      // Mark all as read when opening
      // this.markAllAsRead();
    }
  }

  loadNotifications(): void {
    this.apiService.getNotifications().subscribe({
      next: (notifications: Notification[]) => {
        this.notifications = notifications;
      },
      error: (error: any) => {
        console.error('Error loading notifications:', error);
        // Keep existing notifications on error
      }
    });
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markAllAsRead(): void {
    this.apiService.markAllNotificationsAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
      },
      error: (error: any) => {
        console.error('Error marking all notifications as read:', error);
      }
    });
  }

  handleNotificationClick(notification: Notification): void {
    if (!notification.read) {
      notification.read = true;
      this.apiService.markNotificationAsRead(notification._id).subscribe({
        error: (error: any) => {
          console.error('Error marking notification as read:', error);
          // Revert the read status if API call fails
          notification.read = false;
        }
      });
    }
    if (notification.bookingId) {
      this.router.navigate(['/my-bookings']);
      this.showNotificationMenu = false;
    }
  }

  getNotificationIconClass(type: string): string {
    const classes: { [key: string]: string } = {
      'booking_accepted': 'text-green-600',
      'booking_started': 'text-blue-600',
      'booking_completed': 'text-purple-600',
      'booking_cancelled': 'text-red-600',
      'payment_received': 'text-yellow-600'
    };
    return classes[type] || 'text-gray-600';
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }

  scrollTo(sectionId: string): void {
    const performScroll = () => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    if (this.router.url !== '/') {
      this.router.navigate(['/']).then(() => setTimeout(performScroll, 50));
    } else {
      performScroll();
    }
  }
}
