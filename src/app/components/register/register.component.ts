import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Address {
  country: string;
  city: string;
  region: string;
  building: string;
  street: string;
  fullAddress: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  phone: string;
  whatsapp: string;
  addresses: Address[];
  preferredCompanyId?: string;
}

// UAE cities
const UAE_CITIES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'];

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

          <!-- Addresses -->
          <div class="space-y-6 pt-6 border-t">
            <div class="flex justify-between items-center border-b pb-2">
              <h3 class="text-lg font-semibold text-gray-900">Addresses</h3>
              <button
                type="button"
                (click)="addAddress()"
                class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                + Add Address
              </button>
            </div>
            
            <div formArrayName="addresses" class="space-y-6">
              <div
                *ngFor="let address of addressFormArray.controls; let i = index"
                [formGroupName]="i"
                class="border border-gray-200 rounded-lg p-6 space-y-4 bg-gray-50"
              >
                <div class="flex justify-between items-center mb-4">
                  <h4 class="text-md font-medium text-gray-800">Address {{ i + 1 }}</h4>
                  <button
                    *ngIf="addressFormArray.length > 1"
                    type="button"
                    (click)="removeAddress(i)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
                
                <!-- Address Type Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Address Type <span class="text-red-500">*</span>
                  </label>
                  <div class="flex gap-2">
                    <button
                      type="button"
                      (click)="setAddressType(i, 'Home')"
                      [class.bg-blue-600]="address.get('type')?.value === 'Home'"
                      [class.text-white]="address.get('type')?.value === 'Home'"
                      [class.bg-gray-200]="address.get('type')?.value !== 'Home'"
                      [class.text-gray-700]="address.get('type')?.value !== 'Home'"
                      class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    >
                      Home
                    </button>
                    <button
                      type="button"
                      (click)="setAddressType(i, 'Work')"
                      [class.bg-blue-600]="address.get('type')?.value === 'Work'"
                      [class.text-white]="address.get('type')?.value === 'Work'"
                      [class.bg-gray-200]="address.get('type')?.value !== 'Work'"
                      [class.text-gray-700]="address.get('type')?.value !== 'Work'"
                      class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    >
                      Work
                    </button>
                    <button
                      type="button"
                      (click)="setAddressType(i, 'Other')"
                      [class.bg-blue-600]="address.get('type')?.value === 'Other'"
                      [class.text-white]="address.get('type')?.value === 'Other'"
                      [class.bg-gray-200]="address.get('type')?.value !== 'Other'"
                      [class.text-gray-700]="address.get('type')?.value !== 'Other'"
                      class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    >
                      Other
                    </button>
                  </div>
                  <input type="hidden" formControlName="type" />
                  <div *ngIf="address.get('type')?.value === 'Other'" class="mt-2">
                    <input
                      type="text"
                      formControlName="label"
                      placeholder="Enter label (e.g., Summer House)"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Country <span class="text-red-500">*</span>
                    </label>
                    <select
                      formControlName="country"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      [class.border-red-500]="address.get('country')?.invalid && address.get('country')?.touched"
                    >
                      <option value="UAE">United Arab Emirates</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      City <span class="text-red-500">*</span>
                    </label>
                    <select
                      formControlName="city"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      [class.border-red-500]="address.get('city')?.invalid && address.get('city')?.touched"
                    >
                      <option value="">Select City</option>
                      <option *ngFor="let city of uaeCities" [value]="city">{{ city }}</option>
                    </select>
                    <div *ngIf="address.get('city')?.invalid && address.get('city')?.touched" 
                         class="text-red-500 text-xs mt-1">
                      City is required
                    </div>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Region <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    formControlName="region"
                    placeholder="e.g., Downtown Dubai"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    [class.border-red-500]="address.get('region')?.invalid && address.get('region')?.touched"
                  />
                  <div *ngIf="address.get('region')?.invalid && address.get('region')?.touched" 
                       class="text-red-500 text-xs mt-1">
                    Region is required
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Building <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      formControlName="building"
                      placeholder="Building name or number"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      [class.border-red-500]="address.get('building')?.invalid && address.get('building')?.touched"
                    />
                    <div *ngIf="address.get('building')?.invalid && address.get('building')?.touched" 
                         class="text-red-500 text-xs mt-1">
                      Building is required
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Street <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      formControlName="street"
                      placeholder="Street name"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      [class.border-red-500]="address.get('street')?.invalid && address.get('street')?.touched"
                    />
                    <div *ngIf="address.get('street')?.invalid && address.get('street')?.touched" 
                         class="text-red-500 text-xs mt-1">
                      Street is required
                    </div>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Flat / Villa No.
                  </label>
                  <input
                    type="text"
                    formControlName="flatOrVillaNo"
                    placeholder="e.g., 4235"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Address (full address) <span class="text-red-500">*</span>
                  </label>
                  <textarea
                    formControlName="fullAddress"
                    rows="3"
                    placeholder="Full address including all details"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    [class.border-red-500]="address.get('fullAddress')?.invalid && address.get('fullAddress')?.touched"
                  ></textarea>
                  <div *ngIf="address.get('fullAddress')?.invalid && address.get('fullAddress')?.touched" 
                       class="text-red-500 text-xs mt-1">
                    Full address is required
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Directions (Optional)
                  </label>
                  <textarea
                    formControlName="directions"
                    rows="2"
                    placeholder="Additional directions to help locate the address"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  ></textarea>
                </div>
                
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    formControlName="isDefault"
                    id="default-{{i}}"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label for="default-{{i}}" class="ml-2 block text-sm text-gray-700">
                    Set as default address
                  </label>
                </div>
              </div>
            </div>
            
            <div *ngIf="registerForm.get('addresses')?.invalid && registerForm.get('addresses')?.touched && addressFormArray.length === 0" 
                 class="text-red-500 text-sm">
              At least one address is required
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
  uaeCities = UAE_CITIES;
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
      whatsapp: ['', [Validators.required, phoneValidator]],
      addresses: this.fb.array([], Validators.required)
    });

    // Add initial address
    this.addAddress();
  }

  get addressFormArray(): FormArray {
    return this.registerForm.get('addresses') as FormArray;
  }

  addAddress(): void {
    const addressGroup = this.fb.group({
      country: ['UAE', Validators.required],
      city: ['', Validators.required],
      region: ['', Validators.required],
      building: ['', Validators.required],
      street: ['', Validators.required],
      fullAddress: ['', Validators.required],
      flatOrVillaNo: [''],
      directions: [''],
      type: ['Home', Validators.required],
      isDefault: [false],
      label: ['']
    });
    this.addressFormArray.push(addressGroup);
  }

  setAddressType(index: number, type: string): void {
    const addressGroup = this.addressFormArray.at(index) as FormGroup;
    addressGroup.patchValue({ type });
    if (type !== 'Other') {
      addressGroup.patchValue({ label: '' });
    }
  }

  removeAddress(index: number): void {
    if (this.addressFormArray.length > 1) {
      this.addressFormArray.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.isLoading || this.registerForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
      
      // Mark all address fields as touched
      this.addressFormArray.controls.forEach(addressGroup => {
        if (addressGroup instanceof FormGroup) {
          Object.keys(addressGroup.controls).forEach(key => {
            addressGroup.get(key)?.markAsTouched();
          });
        }
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
      whatsapp: formValue.whatsapp,
      addresses: formValue.addresses
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
