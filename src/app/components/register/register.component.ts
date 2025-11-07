import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface RegisterRequest {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  phone: string;
  whatsapp: string;
  preferredCompanyId?: string;
}


// Phone number validator (10 digits)
function phoneValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(value) ? null : { invalidPhone: { value: control.value } };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="mb-8">
          <h2 class="text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Or
            <button (click)="goToLogin()" class="font-medium text-primary-600 hover:text-primary-500">
              sign in to existing account
            </button>
          </p>
        </div>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="bg-white shadow-lg rounded-lg p-8 space-y-6">
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
                  [class.border-red-500]="registerForm.get('firstname')?.invalid && registerForm.get('firstname')?.touched"
                />
                <div *ngIf="registerForm.get('firstname')?.invalid && registerForm.get('firstname')?.touched" 
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
                  [class.border-red-500]="registerForm.get('lastname')?.invalid && registerForm.get('lastname')?.touched"
                />
                <div *ngIf="registerForm.get('lastname')?.invalid && registerForm.get('lastname')?.touched" 
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
                formControlName="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                [class.border-red-500]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
              />
              <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" 
                   class="text-red-500 text-xs mt-1">
                <span *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</span>
                <span *ngIf="registerForm.get('email')?.errors?.['email']">Please enter a valid email</span>
              </div>
            </div>
            
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                Password <span class="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                [class.border-red-500]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
              />
              <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" 
                   class="text-red-500 text-xs mt-1">
                <span *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</span>
                <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 8 characters</span>
              </div>
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
                  [class.border-red-500]="registerForm.get('phone')?.invalid && registerForm.get('phone')?.touched"
                />
                <div *ngIf="registerForm.get('phone')?.invalid && registerForm.get('phone')?.touched" 
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
                  [class.border-red-500]="registerForm.get('whatsapp')?.invalid && registerForm.get('whatsapp')?.touched"
                />
                <div *ngIf="registerForm.get('whatsapp')?.invalid && registerForm.get('whatsapp')?.touched" 
                     class="text-red-500 text-xs mt-1">
                  WhatsApp number must be exactly 10 digits
                </div>
              </div>
            </div>
          </div>


          <!-- Error and Success Messages -->
          <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {{ successMessage }}
          </div>

          <!-- Submit Button -->
          <div class="pt-6 border-t">
            <button
              type="submit"
              [disabled]="isLoading || registerForm.invalid"
              class="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span *ngIf="!isLoading">Create Account</span>
              <span *ngIf="isLoading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            </button>
          </div>

          <div class="text-center">
            <button (click)="goHome()" type="button" class="text-sm text-gray-600 hover:text-gray-500">
              ← Back to Home
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      phone: ['', [Validators.required, phoneValidator]],
      whatsapp: ['', [Validators.required, phoneValidator]]
    });
  }


  onSubmit(): void {
    if (this.isLoading || this.registerForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.registerForm.value;
    const registerData: RegisterRequest = {
      firstname: formValue.firstname,
      lastname: formValue.lastname,
      email: formValue.email,
      password: formValue.password,
      phone: formValue.phone,
      whatsapp: formValue.whatsapp
    };

    this.http.post(`${environment.apiUrl}/public/auth/register`, registerData)
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.successMessage = 'Account created successfully! Redirecting to login...';
          
          // Redirect to login after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
