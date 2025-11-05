import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

interface User {
  _id: string;
  email: string;
  firstname: string;
  lastname: string;
  role: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface CustomerProfile {
  _id: string;
  userId: string;
  phone: string;
  whatsapp: string;
  addresses: any[];
  preferredCompanyId?: string;
  user?: {
    _id: string;
    email: string;
    firstname: string;
    lastname: string;
    role: string;
  };
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="mb-8">
          <h2 class="text-center text-3xl font-bold text-gray-900">
            Edit Profile
          </h2>
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="bg-white shadow-lg rounded-lg p-8 space-y-6">
          <!-- Error Message -->
          <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {{ errorMessage }}
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {{ successMessage }}
          </div>

          <!-- Personal Information -->
          <div class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="firstname" class="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="firstname"
                  type="text"
                  formControlName="firstname"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  [class.border-red-500]="profileForm.get('firstname')?.invalid && profileForm.get('firstname')?.touched"
                />
                <div *ngIf="profileForm.get('firstname')?.invalid && profileForm.get('firstname')?.touched" 
                     class="text-red-500 text-xs mt-1">
                  First name is required
                </div>
              </div>
              
              <div>
                <label for="lastname" class="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="lastname"
                  type="text"
                  formControlName="lastname"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  [class.border-red-500]="profileForm.get('lastname')?.invalid && profileForm.get('lastname')?.touched"
                />
                <div *ngIf="profileForm.get('lastname')?.invalid && profileForm.get('lastname')?.touched" 
                     class="text-red-500 text-xs mt-1">
                  Last name is required
                </div>
              </div>
            </div>
            
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span class="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                [value]="currentUser?.email || ''"
                disabled
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p class="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>
            
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                Password <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-2">
                <input
                  id="password"
                  type="password"
                  value="••••••••"
                  disabled
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <button
                  type="button"
                  (click)="goToChangePassword()"
                  class="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600"
                  title="Change Password"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
              <p class="mt-1 text-xs text-gray-500">Password cannot be viewed. Click the button to change it.</p>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="space-y-6 pt-6 border-t">
            <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
                  Phone No (10 digits) <span class="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  formControlName="phone"
                  maxlength="10"
                  placeholder="5012345678"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  [class.border-red-500]="profileForm.get('phone')?.invalid && profileForm.get('phone')?.touched"
                />
                <div *ngIf="profileForm.get('phone')?.invalid && profileForm.get('phone')?.touched" 
                     class="text-red-500 text-xs mt-1">
                  Phone number must be exactly 10 digits
                </div>
              </div>
              
              <div>
                <label for="whatsapp" class="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp (10 digits) <span class="text-red-500">*</span>
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  formControlName="whatsapp"
                  maxlength="10"
                  placeholder="5012345678"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  [class.border-red-500]="profileForm.get('whatsapp')?.invalid && profileForm.get('whatsapp')?.touched"
                />
                <div *ngIf="profileForm.get('whatsapp')?.invalid && profileForm.get('whatsapp')?.touched" 
                     class="text-red-500 text-xs mt-1">
                  WhatsApp number must be exactly 10 digits
                </div>
              </div>
            </div>
          </div>

          <!-- Addresses -->
          <div class="space-y-6 pt-6 border-t">
            <div class="flex justify-between items-center border-b pb-2">
              <h3 class="text-lg font-semibold text-gray-900">Addresses</h3>
              <button
                type="button"
                (click)="goToAddresses()"
                class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                + Add Address
              </button>
            </div>
            
            <div *ngIf="customerProfile?.addresses && customerProfile.addresses.length > 0" class="space-y-4">
              <div
                *ngFor="let address of customerProfile.addresses; let i = index"
                class="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="font-semibold text-gray-900">{{ getAddressLabel(address) }}</span>
                      <span *ngIf="address.isDefault" class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Default
                      </span>
                    </div>
                    <div class="text-gray-600 text-sm space-y-1">
                      <div *ngIf="address.flatOrVillaNo">{{ address.flatOrVillaNo }},</div>
                      <div>{{ address.fullAddress }}</div>
                      <div>{{ address.city }}, {{ address.country }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div *ngIf="!customerProfile?.addresses || customerProfile.addresses.length === 0" class="text-center py-8 text-gray-500">
              <p class="text-sm">No addresses added yet. Click "+ Add Address" to add one.</p>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-6 border-t">
            <button
              type="submit"
              [disabled]="isLoading || profileForm.invalid"
              class="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span *ngIf="!isLoading">Save Changes</span>
              <span *ngIf="isLoading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            </button>
          </div>

          <div class="text-center">
            <button (click)="goBack()" type="button" class="text-sm text-gray-600 hover:text-gray-500">
              ← Back to My Bookings
            </button>
          </div>
        </form>
      </div>

      <!-- Password Change Modal -->
      <div *ngIf="showPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" (click)="closePasswordModal()">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full" (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Change Password</h2>
            <button (click)="closePasswordModal()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <form [formGroup]="passwordForm" (ngSubmit)="savePassword()" class="p-6 space-y-6">
            <!-- Error Message -->
            <div *ngIf="passwordErrorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {{ passwordErrorMessage }}
            </div>

            <!-- Success Message -->
            <div *ngIf="passwordSuccessMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {{ passwordSuccessMessage }}
            </div>

            <!-- Current Password -->
            <div>
              <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">
                Current Password <span class="text-red-500">*</span>
              </label>
              <input
                id="currentPassword"
                type="password"
                formControlName="currentPassword"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                [class.border-red-500]="passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched"
              />
              <div *ngIf="passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched" 
                   class="text-red-500 text-xs mt-1">
                Current password is required
              </div>
            </div>

            <!-- New Password -->
            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
                New Password <span class="text-red-500">*</span>
              </label>
              <input
                id="newPassword"
                type="password"
                formControlName="newPassword"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                [class.border-red-500]="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched"
              />
              <div *ngIf="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched" 
                   class="text-red-500 text-xs mt-1">
                <span *ngIf="passwordForm.get('newPassword')?.errors?.['required']">New password is required</span>
                <span *ngIf="passwordForm.get('newPassword')?.errors?.['minlength']">Password must be at least 8 characters</span>
              </div>
              <p class="mt-1 text-xs text-gray-500">Password must be at least 8 characters long</p>
            </div>

            <!-- Confirm New Password -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password <span class="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                [class.border-red-500]="passwordForm.get('confirmPassword')?.invalid && passwordForm.get('confirmPassword')?.touched"
              />
              <div *ngIf="passwordForm.get('confirmPassword')?.invalid && passwordForm.get('confirmPassword')?.touched" 
                   class="text-red-500 text-xs mt-1">
                <span *ngIf="passwordForm.get('confirmPassword')?.errors?.['required']">Please confirm your new password</span>
                <span *ngIf="passwordForm.get('confirmPassword')?.errors?.['passwordMismatch']">Passwords do not match</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 pt-4 border-t">
              <button
                type="button"
                (click)="closePasswordModal()"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="passwordForm.invalid || isChangingPassword"
                class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span *ngIf="!isChangingPassword">Change Password</span>
                <span *ngIf="isChangingPassword">Changing...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  customerProfile: CustomerProfile | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPasswordModal = false;
  isChangingPassword = false;
  passwordErrorMessage = '';
  passwordSuccessMessage = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      whatsapp: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator = (form: FormGroup) => {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value && confirmPassword.value && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmPassword && confirmPassword.errors?.['passwordMismatch']) {
        const errors = { ...confirmPassword.errors };
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    }
    return null;
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadUserFromStorage();
    this.loadProfile();
  }

  private loadUserFromStorage(): void {
    const user = localStorage.getItem('current_user');
    if (user) {
      try {
        this.currentUser = JSON.parse(user);
      } catch (error) {
        console.error('Error parsing user from storage:', error);
      }
    }
  }

  loadProfile(): void {
    this.isLoading = true;
    this.apiService.getCustomerProfile().subscribe({
      next: (response: CustomerProfile) => {
        this.customerProfile = response;
        
        // Update current user from API response if available
        if (response.user) {
          this.currentUser = {
            _id: response.user._id,
            email: response.user.email,
            firstname: response.user.firstname,
            lastname: response.user.lastname,
            role: response.user.role,
            isActive: true,
            createdAt: '',
            updatedAt: ''
          };
          // Update localStorage with fresh user data
          localStorage.setItem('current_user', JSON.stringify(this.currentUser));
        }
        
        // Populate form with current values from API response
        const firstname = response.user?.firstname || this.currentUser?.firstname || '';
        const lastname = response.user?.lastname || this.currentUser?.lastname || '';
        const phone = response.phone || '';
        const whatsapp = response.whatsapp || '';
        
        this.profileForm.patchValue({
          firstname,
          lastname,
          phone,
          whatsapp
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load profile';
        this.isLoading = false;
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const profileData = this.profileForm.value;

    this.apiService.updateCustomerProfile(profileData).subscribe({
      next: () => {
        this.successMessage = 'Profile updated successfully';
        
        // Reload profile data to get updated values - this will update localStorage
        this.apiService.getCustomerProfile().subscribe({
          next: (response: CustomerProfile) => {
            this.customerProfile = response;
            
            // Update current user from API response if available
            if (response.user) {
              this.currentUser = {
                _id: response.user._id,
                email: response.user.email,
                firstname: response.user.firstname,
                lastname: response.user.lastname,
                role: response.user.role,
                isActive: true,
                createdAt: '',
                updatedAt: ''
              };
              // Update localStorage with fresh user data
              localStorage.setItem('current_user', JSON.stringify(this.currentUser));
              
              // Dispatch custom event AFTER localStorage is updated
              // Use setTimeout to ensure localStorage write is complete
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('userProfileUpdated'));
              }, 100);
            }
            
            // Update form with latest values
            this.profileForm.patchValue({
              firstname: response.user?.firstname || '',
              lastname: response.user?.lastname || '',
              phone: response.phone || '',
              whatsapp: response.whatsapp || ''
            });
            
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to update profile';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/my-bookings']);
  }

  goToAddresses(): void {
    this.router.navigate(['/addresses']);
  }

  goToChangePassword(): void {
    this.showPasswordModal = true;
    this.passwordForm.reset();
    this.passwordErrorMessage = '';
    this.passwordSuccessMessage = '';
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.passwordForm.reset();
    this.passwordErrorMessage = '';
    this.passwordSuccessMessage = '';
  }

  savePassword(): void {
    if (this.passwordForm.invalid) {
      Object.keys(this.passwordForm.controls).forEach(key => {
        this.passwordForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isChangingPassword = true;
    this.passwordErrorMessage = '';
    this.passwordSuccessMessage = '';

    const passwordData = {
      currentPassword: this.passwordForm.get('currentPassword')?.value,
      newPassword: this.passwordForm.get('newPassword')?.value
    };

    this.apiService.changePassword(passwordData).subscribe({
      next: () => {
        this.passwordSuccessMessage = 'Password changed successfully';
        this.isChangingPassword = false;
        
        // Close modal after 2 seconds
        setTimeout(() => {
          this.closePasswordModal();
        }, 2000);
      },
      error: (error) => {
        this.passwordErrorMessage = error.error?.message || 'Failed to change password. Please check your current password.';
        this.isChangingPassword = false;
      }
    });
  }

  getAddressLabel(address: any): string {
    if (address.type === 'Other' && address.label) {
      return address.label;
    }
    return address.type;
  }
}

