import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

declare var google: any;

interface Address {
  country: string;
  city: string;
  region: string;
  building: string;
  street: string;
  fullAddress: string;
  flatOrVillaNo?: string;
  directions?: string;
  type: 'Home' | 'Work' | 'Other';
  isDefault: boolean;
  label?: string;
}

const UAE_CITIES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'];

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-6 flex items-center gap-4">
          <button (click)="goBack()" class="text-gray-600 hover:text-gray-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h1 class="text-3xl font-bold text-gray-900">Addresses</h1>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div *ngIf="successMessage" class="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {{ successMessage }}
        </div>

        <!-- Address List Card -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <!-- Add New Address Button -->
          <button
            (click)="openAddModal()"
            class="w-full flex items-center justify-center gap-2 py-3 px-4 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors mb-6"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add New Address
          </button>

          <!-- Addresses List -->
          <div *ngIf="addresses.length === 0" class="text-center py-8 text-gray-500">
            No addresses added yet. Click "Add New Address" to get started.
          </div>

          <div *ngFor="let address of addresses; let i = index" class="border-b border-gray-200 last:border-b-0 pb-4 mb-4 last:mb-0">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <svg *ngIf="address.isDefault" class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="font-semibold text-gray-900">{{ getAddressLabel(address) }}</span>
                  <span *ngIf="address.isDefault" class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Default address
                  </span>
                </div>
                <div class="text-gray-600 text-sm space-y-1">
                  <div *ngIf="address.flatOrVillaNo">{{ address.flatOrVillaNo }},</div>
                  <div>{{ address.fullAddress }}</div>
                  <div>{{ address.city }}</div>
                </div>
              </div>
              <button
                (click)="openEditModal(i)"
                class="ml-4 text-blue-600 hover:text-blue-800 p-2"
                title="Edit address"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Address Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" (click)="closeModal()">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <button (click)="closeModal()" class="text-gray-600 hover:text-gray-900">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <h2 class="text-xl font-semibold text-gray-900">Address Details</h2>
            </div>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <form [formGroup]="addressForm" (ngSubmit)="saveAddress()" class="p-6 space-y-6">
            <!-- Google Maps -->
            <div>
              <div *ngIf="isMapLoading" class="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <div class="text-gray-500">Loading map...</div>
              </div>
              <div
                #mapContainer
                id="map"
                class="w-full h-64 rounded-lg overflow-hidden border border-gray-300 relative"
                [style.display]="isMapLoading ? 'none' : 'block'"
              ></div>
              <div class="mt-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded">
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Move the map to set the exact position
              </div>
            </div>

            <!-- Address Type Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                Address Type <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-2">
                <button
                  type="button"
                  (click)="setAddressType('Home')"
                  [class.bg-blue-600]="addressForm.get('type')?.value === 'Home'"
                  [class.text-white]="addressForm.get('type')?.value === 'Home'"
                  [class.bg-gray-200]="addressForm.get('type')?.value !== 'Home'"
                  [class.text-gray-700]="addressForm.get('type')?.value !== 'Home'"
                  class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  Home
                </button>
                <button
                  type="button"
                  (click)="setAddressType('Work')"
                  [class.bg-blue-600]="addressForm.get('type')?.value === 'Work'"
                  [class.text-white]="addressForm.get('type')?.value === 'Work'"
                  [class.bg-gray-200]="addressForm.get('type')?.value !== 'Work'"
                  [class.text-gray-700]="addressForm.get('type')?.value !== 'Work'"
                  class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  Work
                </button>
                <button
                  type="button"
                  (click)="setAddressType('Other')"
                  [class.bg-blue-600]="addressForm.get('type')?.value === 'Other'"
                  [class.text-white]="addressForm.get('type')?.value === 'Other'"
                  [class.bg-gray-200]="addressForm.get('type')?.value !== 'Other'"
                  [class.text-gray-700]="addressForm.get('type')?.value !== 'Other'"
                  class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  Other
                </button>
              </div>
              <input type="hidden" formControlName="type" />
              <div *ngIf="addressForm.get('type')?.value === 'Other'" class="mt-3">
                <input
                  type="text"
                  formControlName="label"
                  placeholder="Enter label (e.g., Summer House)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <!-- City and Country -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Country <span class="text-red-500">*</span>
                </label>
                <select
                  formControlName="country"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  [disabled]="true"
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
                  [class.border-red-500]="addressForm.get('city')?.invalid && addressForm.get('city')?.touched"
                >
                  <option value="">Select City</option>
                  <option *ngFor="let city of uaeCities" [value]="city">{{ city }}</option>
                </select>
              </div>
            </div>

            <!-- Region -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Region <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                formControlName="region"
                placeholder="e.g., Downtown Dubai"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <!-- Building and Street -->
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
                />
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
                />
              </div>
            </div>

            <!-- Flat/Villa No -->
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

            <!-- Full Address -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Address / Building Name <span class="text-red-500">*</span>
              </label>
              <textarea
                formControlName="fullAddress"
                rows="3"
                placeholder="Full address including all details"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              ></textarea>
            </div>

            <!-- Directions -->
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

            <!-- Default Address Checkbox -->
            <div class="flex items-center">
              <input
                type="checkbox"
                formControlName="isDefault"
                id="defaultAddress"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label for="defaultAddress" class="ml-2 block text-sm text-gray-700">
                Set as default address
              </label>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 pt-4 border-t">
              <button
                type="button"
                (click)="closeModal()"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                *ngIf="isEditing && !editingIndexIsDefault"
                type="button"
                (click)="deleteAddress()"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
              <button
                type="submit"
                [disabled]="addressForm.invalid || isLoading"
                class="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span *ngIf="!isLoading">Save Address</span>
                <span *ngIf="isLoading">Saving...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AddressesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  addresses: Address[] = [];
  showModal = false;
  isEditing = false;
  editingIndex = -1;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  uaeCities = UAE_CITIES;
  addressForm: FormGroup;

  map: any = null;
  marker: any = null;
  geocoder: any = null;
  mapInitialized = false;
  isMapLoading = false;
  private mapsScriptLoaded = false;
  private googleMapsApiKey = environment.googleMapsApiKey;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.addressForm = this.fb.group({
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
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadAddresses();
    this.loadGoogleMapsScript();
  }

  ngAfterViewInit(): void {
    // Map will be initialized when modal opens
  }

  ngOnDestroy(): void {
    if (this.map) {
      // Clean up map if needed
    }
  }

  loadGoogleMapsScript(): void {
    if (this.mapsScriptLoaded || typeof google !== 'undefined') {
      return;
    }

    // Check if script already exists
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      this.mapsScriptLoaded = true;
      if (this.showModal) {
        setTimeout(() => this.initMap(), 100);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleMapsApiKey}&libraries=places,geocoding`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.mapsScriptLoaded = true;
      if (this.showModal) {
        setTimeout(() => this.initMap(), 100);
      }
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps script. Please check your API key.');
      this.isMapLoading = false;
    };
    document.head.appendChild(script);
  }

  initMap(): void {
    if (!this.mapContainer || typeof google === 'undefined') {
      return;
    }

    this.isMapLoading = true;

    // Default to Dubai, UAE
    const defaultLocation = { lat: 25.2048, lng: 55.2708 };

    // Try to get location from form if editing
    let initialLocation = defaultLocation;
    if (this.isEditing && this.addressForm.get('fullAddress')?.value) {
      // If editing, try to geocode the existing address
      this.geocodeAddress(this.addressForm.get('fullAddress')?.value).then(location => {
        if (location) {
          initialLocation = location;
          this.createMap(initialLocation);
        } else {
          this.createMap(initialLocation);
        }
      }).catch(() => {
        this.createMap(initialLocation);
      });
    } else {
      this.createMap(initialLocation);
    }
  }

  createMap(center: { lat: number; lng: number }): void {
    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: center,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    this.geocoder = new google.maps.Geocoder();

    // Create draggable marker
    this.marker = new google.maps.Marker({
      map: this.map,
      position: center,
      draggable: true,
      animation: google.maps.Animation.DROP
    });

    // Reverse geocode when marker is dragged
    google.maps.event.addListener(this.marker, 'dragend', () => {
      this.reverseGeocode(this.marker.getPosition());
    });

    // Reverse geocode when map is clicked
    google.maps.event.addListener(this.map, 'click', (event: any) => {
      this.marker.setPosition(event.latLng);
      this.reverseGeocode(event.latLng);
    });

    // Initial reverse geocode - create LatLng object
    const initialLatLng = new google.maps.LatLng(center.lat, center.lng);
    this.reverseGeocode(initialLatLng);

    this.isMapLoading = false;
    this.mapInitialized = true;
  }

  reverseGeocode(location: { lat: () => number; lng: () => number }): void {
    if (!this.geocoder) return;

    const latlng = {
      lat: location.lat(),
      lng: location.lng()
    };

    this.geocoder.geocode({ location: latlng }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        this.parseAddressComponents(results[0]);
      }
    });
  }

  parseAddressComponents(result: any): void {
    const addressComponents = result.address_components;
    let streetNumber = '';
    let route = '';
    let locality = '';
    let administrativeAreaLevel1 = '';
    let sublocality = '';
    let premise = '';
    let streetAddress = '';

    addressComponents.forEach((component: any) => {
      const types = component.types;

      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      }
      if (types.includes('route')) {
        route = component.long_name;
      }
      if (types.includes('locality')) {
        locality = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        administrativeAreaLevel1 = component.long_name;
      }
      if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
        sublocality = component.long_name;
      }
      if (types.includes('premise')) {
        premise = component.long_name;
      }
    });

    // Map to UAE cities
    const uaeCityMap: { [key: string]: string } = {
      'Dubai': 'Dubai',
      'Abu Dhabi': 'Abu Dhabi',
      'Sharjah': 'Sharjah',
      'Ajman': 'Ajman',
      'Umm Al Quwain': 'Umm Al Quwain',
      'Ras Al Khaimah': 'Ras Al Khaimah',
      'Fujairah': 'Fujairah'
    };

    // Determine city
    let city = 'Dubai'; // Default
    if (locality && uaeCityMap[locality]) {
      city = locality;
    } else if (administrativeAreaLevel1 && uaeCityMap[administrativeAreaLevel1]) {
      city = administrativeAreaLevel1;
    }

    // Build street address
    streetAddress = [streetNumber, route].filter(Boolean).join(' ');
    if (!streetAddress && premise) {
      streetAddress = premise;
    }

    // Update form
    this.addressForm.patchValue({
      fullAddress: result.formatted_address,
      street: route || streetAddress,
      building: premise || streetNumber || '',
      region: sublocality || locality || '',
      city: city
    }, { emitEvent: false });
  }

  async geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!this.geocoder && typeof google !== 'undefined') {
        this.geocoder = new google.maps.Geocoder();
      }

      if (!this.geocoder) {
        resolve(null);
        return;
      }

      this.geocoder.geocode({ address: address }, (results: any[], status: string) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  loadAddresses(): void {
    this.isLoading = true;
    this.apiService.getCustomerProfile().subscribe({
      next: (response) => {
        this.addresses = response.addresses || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load addresses';
        this.isLoading = false;
      }
    });
  }

  getAddressLabel(address: Address): string {
    if (address.type === 'Other' && address.label) {
      return address.label;
    }
    return address.type;
  }

  get editingIndexIsDefault(): boolean {
    if (this.editingIndex >= 0 && this.addresses[this.editingIndex]) {
      return this.addresses[this.editingIndex].isDefault;
    }
    return false;
  }

  openAddModal(): void {
    this.isEditing = false;
    this.editingIndex = -1;
    this.addressForm.reset({
      country: 'UAE',
      city: '',
      region: '',
      building: '',
      street: '',
      fullAddress: '',
      flatOrVillaNo: '',
      directions: '',
      type: 'Home',
      isDefault: this.addresses.length === 0,
      label: ''
    });
    this.showModal = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Initialize map after modal opens
    setTimeout(() => {
      if (this.mapsScriptLoaded || typeof google !== 'undefined') {
        this.initMap();
      } else {
        this.loadGoogleMapsScript();
      }
    }, 100);
  }

  openEditModal(index: number): void {
    this.isEditing = true;
    this.editingIndex = index;
    const address = this.addresses[index];
    this.addressForm.patchValue({
      country: address.country || 'UAE',
      city: address.city,
      region: address.region,
      building: address.building,
      street: address.street,
      fullAddress: address.fullAddress,
      flatOrVillaNo: address.flatOrVillaNo || '',
      directions: address.directions || '',
      type: address.type,
      isDefault: address.isDefault,
      label: address.label || ''
    });
    this.showModal = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Initialize map after modal opens
    setTimeout(() => {
      if (this.mapsScriptLoaded || typeof google !== 'undefined') {
        this.initMap();
      } else {
        this.loadGoogleMapsScript();
      }
    }, 100);
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.editingIndex = -1;
    this.addressForm.reset();

    // Clean up map
    if (this.marker) {
      this.marker.setMap(null);
      this.marker = null;
    }
    if (this.map) {
      this.map = null;
    }
    this.mapInitialized = false;
  }

  setAddressType(type: string): void {
    this.addressForm.patchValue({ type });
    if (type !== 'Other') {
      this.addressForm.patchValue({ label: '' });
    }
  }

  saveAddress(): void {
    if (this.addressForm.invalid) {
      Object.keys(this.addressForm.controls).forEach(key => {
        this.addressForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const addressData = this.addressForm.value;

    if (this.isEditing) {
      this.apiService.updateAddress(this.editingIndex, addressData).subscribe({
        next: () => {
          this.successMessage = 'Address updated successfully';
          this.loadAddresses();
          setTimeout(() => this.closeModal(), 1000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to update address';
          this.isLoading = false;
        }
      });
    } else {
      this.apiService.addAddress(addressData).subscribe({
        next: () => {
          this.successMessage = 'Address added successfully';
          this.loadAddresses();
          setTimeout(() => this.closeModal(), 1000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to add address';
          this.isLoading = false;
        }
      });
    }
  }

  deleteAddress(): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.isLoading = true;
      this.apiService.deleteAddress(this.editingIndex).subscribe({
        next: () => {
          this.successMessage = 'Address deleted successfully';
          this.loadAddresses();
          setTimeout(() => this.closeModal(), 1000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to delete address';
          this.isLoading = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/my-bookings']);
  }
}

