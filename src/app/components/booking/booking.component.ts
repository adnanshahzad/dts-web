import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Service, BookingRequest } from '../../services/api.service';
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

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <button
            (click)="goBack()"
            class="flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Services
          </button>
          <h1 class="text-3xl font-bold text-gray-900">Book Service</h1>
        </div>

        <div *ngIf="isLoading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p class="mt-2 text-gray-600">Loading service details...</p>
        </div>

        <div *ngIf="!isLoading && service" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Service Details -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">Service Details</h2>

            <div *ngIf="service.images && service.images.length > 0" class="mb-4">
              <img
                [src]="getImageUrl(service.images[0])"
                [alt]="service.name"
                class="w-full h-48 object-cover rounded-lg"
                (error)="onImageError($event)"
              />
            </div>

            <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ service.name }}</h3>
            <p class="text-gray-600 mb-4">{{ service.description || 'No description available' }}</p>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Select Duration & Price:
              </label>
              <div class="space-y-2">
                <div *ngFor="let duration of service.durations; let i = index"
                     class="flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-colors"
                     [class.border-primary-600]="selectedDurationIndex === i"
                     [class.bg-primary-50]="selectedDurationIndex === i"
                     [class.border-gray-300]="selectedDurationIndex !== i"
                     [class.bg-white]="selectedDurationIndex !== i"
                     (click)="selectDuration(i)">
                  <div class="flex items-center gap-3">
                    <input type="radio"
                           [name]="'duration-' + service._id"
                           [value]="i"
                           [checked]="selectedDurationIndex === i"
                           (change)="selectDuration(i)"
                           class="w-4 h-4 text-primary-600 focus:ring-primary-500">
                    <div>
                      <span class="font-medium text-gray-900">{{ duration.duration }} minutes</span>
                      <span class="text-gray-500 ml-2">- 
                        <span *ngIf="duration.discountPrice !== undefined && duration.discountPrice !== null">
                          <span class="line-through text-gray-400 mr-1">AED {{ duration.price }}</span>
                          <span class="text-green-600 font-semibold">AED {{ duration.discountPrice }}</span>
                        </span>
                        <span *ngIf="!duration.discountPrice">AED {{ duration.price }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="service.notes" class="bg-gray-50 p-3 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-1">Additional Notes:</h4>
              <p class="text-sm text-gray-600">{{ service.notes }}</p>
            </div>
          </div>

          <!-- Booking Form -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-semibold text-gray-900 mb-6">Booking Information</h2>

            <form (ngSubmit)="submitBooking()" #bookingForm="ngForm">
              <!-- Date Selection Section -->
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">When would you like your service?</h3>
                <div class="relative flex items-center">
                  <button
                    type="button"
                    (click)="scrollDates('left')"
                    class="absolute left-0 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-md flex items-center justify-center w-8 h-8"
                    style="top: calc(50% + 13px); transform: translateY(-50%);"
                  >
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </button>
                  <div
                    id="date-scroll-container"
                    class="flex gap-2 overflow-x-auto flex-nowrap px-10"
                    style="scroll-behavior: smooth; scrollbar-width: none; -ms-overflow-style: none;"
                  >
                    <div *ngFor="let date of availableDates; let i = index" class="flex-shrink-0 flex flex-col items-center">
                      <span class="text-sm font-bold mb-1" [class.text-primary-600]="selectedDateIndex === i" [class.text-gray-700]="selectedDateIndex !== i">
                        {{ date.dayName }}
                      </span>
                      <button
                        type="button"
                        (click)="selectDate(i)"
                        [class.bg-primary-50]="selectedDateIndex === i"
                        [class.border-primary-500]="selectedDateIndex === i"
                        [class.border-gray-300]="selectedDateIndex !== i"
                        [class.text-primary-600]="selectedDateIndex === i"
                        [class.text-gray-900]="selectedDateIndex !== i"
                        class="flex items-center justify-center w-14 h-14 rounded-full border-2 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <span class="text-base font-bold">
                          {{ date.dateNumber }}
                        </span>
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    (click)="scrollDates('right')"
                    class="absolute right-0 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-md flex items-center justify-center w-8 h-8"
                    style="top: calc(50% + 13px); transform: translateY(-50%);"
                  >
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
                <style>
                  #date-scroll-container::-webkit-scrollbar {
                    display: none;
                  }
                </style>
                <!-- Hidden input for form validation -->
                <input
                  type="hidden"
                  name="bookingDate"
                  [(ngModel)]="bookingData.bookingDate"
                  #dateInput="ngModel"
                  required
                />
                <div *ngIf="dateInput.invalid && dateInput.touched" class="mt-1 text-sm text-red-600">
                  Please select a valid date
                </div>
              </div>

              <!-- Time Selection Section -->
              <div class="mb-6">
                <div class="mb-3">
                  <h3 class="text-lg font-semibold text-gray-900">What time would you like us to start?</h3>
                </div>
                <div class="relative flex items-center">
                  <button
                    type="button"
                    (click)="scrollTimes('left')"
                    class="absolute left-0 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-md flex items-center justify-center w-8 h-8 top-1/2 -translate-y-1/2"
                  >
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </button>
                  <div
                    id="time-scroll-container"
                    class="flex gap-2 overflow-x-auto flex-nowrap px-10"
                    style="scroll-behavior: smooth; scrollbar-width: none; -ms-overflow-style: none;"
                  >
                    <button
                      *ngFor="let timeSlot of availableTimeSlots; let i = index"
                      type="button"
                      (click)="selectTime(i)"
                      [class.bg-primary-50]="selectedTimeIndex === i"
                      [class.border-primary-500]="selectedTimeIndex === i"
                      [class.border-gray-300]="selectedTimeIndex !== i"
                      [class.text-primary-600]="selectedTimeIndex === i"
                      [class.text-gray-900]="selectedTimeIndex !== i"
                      class="flex-shrink-0 px-4 py-2 rounded-lg border-2 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      {{ timeSlot }}
                    </button>
                  </div>
                  <button
                    type="button"
                    (click)="scrollTimes('right')"
                    class="absolute right-0 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-md flex items-center justify-center w-8 h-8 top-1/2 -translate-y-1/2"
                  >
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
                <style>
                  #time-scroll-container::-webkit-scrollbar {
                    display: none;
                  }
                </style>
                <!-- Hidden input for form validation -->
                <input
                  type="hidden"
                  name="bookingTime"
                  [(ngModel)]="bookingData.bookingTime"
                  #timeInput="ngModel"
                  required
                />
                <div *ngIf="timeInput.invalid && timeInput.touched" class="mt-1 text-sm text-red-600">
                  Please select a time
                </div>
              </div>

              <!-- Customer Notes -->
              <div class="mb-6">
                <label for="customerNotes" class="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="customerNotes"
                  name="customerNotes"
                  [(ngModel)]="bookingData.customerNotes"
                  rows="3"
                  maxlength="500"
                  placeholder="Any special requests or notes..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                ></textarea>
                <div class="mt-1 text-sm text-gray-500">
                  {{ (bookingData.customerNotes || '').length }}/500 characters
                </div>
              </div>

              <!-- Booking Summary -->
              <div class="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 class="font-medium text-gray-900 mb-2">Booking Summary</h3>
                <div *ngIf="selectedAddress" class="mb-3 pb-3 border-b border-gray-300">
                  <div class="flex items-start justify-between mb-1">
                    <div class="flex-1">
                      <div class="text-sm text-gray-600 mb-1">
                        <span class="font-medium text-gray-900">{{ getAddressLabel(selectedAddress) }}:</span>
                      </div>
                      <div class="text-sm text-gray-600">
                        <div *ngIf="selectedAddress.flatOrVillaNo" class="mb-1">{{ selectedAddress.flatOrVillaNo }},</div>
                        <div>{{ selectedAddress.fullAddress }}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      (click)="openAddressSelection()"
                      class="ml-2 text-sm text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap"
                    >
                      Change
                    </button>
                  </div>
                </div>
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Service:</span>
                  <span>{{ service.name }}</span>
                </div>
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Duration:</span>
                  <span>{{ getSelectedDuration()?.duration || 0 }} minutes</span>
                </div>
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Price:</span>
                  <span>
                    <span *ngIf="getSelectedDuration()?.discountPrice !== undefined && getSelectedDuration()?.discountPrice !== null">
                      <span class="line-through text-gray-400 mr-1">AED {{ getSelectedDuration()?.price || 0 }}</span>
                      <span class="text-green-600 font-semibold">AED {{ getSelectedDuration()?.discountPrice || 0 }}</span>
                    </span>
                    <span *ngIf="!getSelectedDuration()?.discountPrice">AED {{ getSelectedDuration()?.price || 0 }}</span>
                  </span>
                </div>
                <div *ngIf="bookingData.bookingDate" class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Date:</span>
                  <span>{{ formatDate(bookingData.bookingDate) }}</span>
                </div>
                <div *ngIf="bookingData.bookingTime" class="flex justify-between text-sm text-gray-600">
                  <span>Time:</span>
                  <span>{{ bookingData.bookingTime }}</span>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                [disabled]="!bookingForm.valid || isSubmitting || !isValidTimeSelected() || !service || !service.durations || service.durations.length === 0 || !selectedAddress"
                class="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                <span *ngIf="!isSubmitting">Confirm Booking</span>
                <span *ngIf="isSubmitting" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              </button>
            </form>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="!isLoading && !service" class="text-center py-12">
          <div class="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Service not found</h3>
          <p class="text-gray-500 mb-4">The service you're looking for doesn't exist or has been removed.</p>
          <button (click)="goBack()" class="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
            Back to Services
          </button>
        </div>
      </div>
    </div>

    <!-- Address Selection Popup -->
    <div *ngIf="showAddressPopup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" (click)="closeAddressPopup()">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Address</h2>
          <button (click)="closeAddressPopup()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-4">
          <button
            (click)="openAddNewAddress()"
            class="w-full flex items-center justify-start gap-2 py-2 px-3 text-primary-600 font-medium hover:bg-primary-50 rounded-lg transition-colors mb-4"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add New Address
          </button>
          <div *ngIf="addresses.length > 0" class="space-y-3">
            <div *ngFor="let address of addresses; let i = index" class="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer" (click)="selectAddress(i)">
              <input
                type="radio"
                [name]="'address-' + i"
                [checked]="selectedAddressIndex === i"
                (click)="selectAddress(i)"
                class="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <div class="flex-1">
                <div class="font-semibold text-gray-900 mb-1">{{ getAddressLabel(address) }}</div>
                <div class="text-sm text-gray-600">
                  <div *ngIf="address.flatOrVillaNo">{{ address.flatOrVillaNo }},</div>
                  <div>{{ address.fullAddress }}</div>
                </div>
              </div>
            </div>
          </div>
          <div *ngIf="addresses.length === 0" class="text-center py-4 text-gray-500 text-sm">
            No addresses found. Click "Add New Address" to add one.
          </div>
        </div>
        <div class="p-4 border-t border-gray-200">
          <button
            (click)="confirmAddressSelection()"
            [disabled]="selectedAddressIndex === -1"
            class="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Select
          </button>
        </div>
      </div>
    </div>

    <!-- Map Pin Selection Modal -->
    <div *ngIf="showMapPinModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" (click)="closeMapPinModal()">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Select Address</h2>
          <button (click)="closeMapPinModal()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-4">
          <!-- Search Bar -->
          <div class="mb-4 flex gap-2">
            <input
              type="text"
              [(ngModel)]="mapSearchQuery"
              (keyup.enter)="searchMapLocation()"
              placeholder="Search for area, street name, land..."
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              (click)="setMyLocation()"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Set my location
            </button>
          </div>
          <!-- Map Container -->
          <div *ngIf="isMapLoading" class="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
            <div class="text-gray-500">Loading map...</div>
          </div>
          <div
            #mapPinContainer
            id="map-pin-container"
            class="w-full h-96 rounded-lg overflow-hidden border border-gray-300 relative"
            [style.display]="isMapLoading ? 'none' : 'block'"
          ></div>
          <div class="mt-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded">
            Move the map to set the exact position
          </div>
        </div>
        <div class="p-4 border-t border-gray-200">
          <button
            (click)="confirmPinLocation()"
            class="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors confirm-pin-button"
          >
            Confirm Pin Location
          </button>
        </div>
      </div>
    </div>

    <!-- Address Details Modal -->
    <div *ngIf="showAddressDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" (click)="closeAddressDetailsModal()">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <button (click)="closeAddressDetailsModal()" class="text-gray-600 hover:text-gray-900">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <h2 class="text-xl font-semibold text-gray-900">Address Details</h2>
          </div>
          <button (click)="closeAddressDetailsModal()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <form [formGroup]="addressForm" (ngSubmit)="saveAddress()" class="p-4 space-y-4">
          <!-- Map Display -->
          <div>
            <div
              #addressDetailsMapContainer
              id="address-details-map"
              class="w-full h-64 rounded-lg overflow-hidden border border-gray-300 relative"
            ></div>
          </div>
          <!-- Address Type Tabs -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Address Type <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-2">
              <button
                type="button"
                (click)="setAddressType('Home')"
                [class.bg-primary-600]="addressForm.get('type')?.value === 'Home'"
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
                [class.bg-primary-600]="addressForm.get('type')?.value === 'Work'"
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
                [class.bg-primary-600]="addressForm.get('type')?.value === 'Other'"
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
          <!-- Address Fields -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Address / Building Name <span class="text-red-500">*</span>
            </label>
            <textarea
              formControlName="fullAddress"
              rows="2"
              placeholder="Address will be auto-filled from map"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
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
              Directions (Optional)
            </label>
            <textarea
              formControlName="directions"
              rows="2"
              placeholder="Additional directions to help locate the address"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>
          <!-- Action Buttons -->
          <div class="flex gap-3 pt-4 border-t">
            <button
              type="button"
              (click)="closeAddressDetailsModal()"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="addressForm.invalid || isSavingAddress"
              class="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span *ngIf="!isSavingAddress">Save Address</span>
              <span *ngIf="isSavingAddress">Saving...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .confirm-pin-button {
      background-color: #ffb20a;
    }
    .confirm-pin-button:hover {
      background-color: #e0a009;
    }
  `]
})
export class BookingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapPinContainer', { static: false }) mapPinContainer!: ElementRef;
  @ViewChild('addressDetailsMapContainer', { static: false }) addressDetailsMapContainer!: ElementRef;

  service: Service | null = null;
  isLoading = true;
  isSubmitting = false;
  minDate = '';
  maxDate = '';
  availableTimes: string[] = [];
  selectedDurationIndex = 0; // Default to first duration

  // Date and time selection
  availableDates: Array<{ date: Date; displayDate: string; dayName: string; dateNumber: string; dateValue: string }> = [];
  allTimeSlots: string[] = []; // All possible time slots
  availableTimeSlots: string[] = []; // Filtered time slots based on selected date
  selectedDateIndex = 0;
  selectedTimeIndex = 0;

  bookingData: BookingRequest = {
    services: [],
    bookingDate: '',
    bookingTime: '',
    customerNotes: ''
  };

  // Address selection
  addresses: Address[] = [];
  showAddressPopup = false;
  showMapPinModal = false;
  showAddressDetailsModal = false;
  selectedAddressIndex = -1;
  selectedAddress: Address | null = null;
  mapSearchQuery = '';
  isMapLoading = false;
  isSavingAddress = false;
  addressForm: FormGroup;

  // Google Maps
  mapPin: any = null;
  mapPinMarker: any = null;
  mapPinGeocoder: any = null;
  addressDetailsMap: any = null;
  addressDetailsMarker: any = null;
  addressDetailsGeocoder: any = null;
  confirmedPinLocation: { lat: number; lng: number } | null = null;
  private mapsScriptLoaded = false;
  private googleMapsApiKey = environment.googleMapsApiKey;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService,
    private fb: FormBuilder
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
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    // Set minimum date to today and max date to 2 weeks from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.minDate = today.toISOString().split('T')[0];

    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 13); // 14 days total (0-13 = 14 days)
    this.maxDate = maxDate.toISOString().split('T')[0];

    // Initialize date and time selection
    this.initializeDateAndTimeSelection();

    // Load service details
    this.loadService();

    // Generate available times
    this.generateAvailableTimes();

    // Load addresses and show popup
    this.loadAddresses();
    this.loadGoogleMapsScript();
  }

  ngAfterViewInit(): void {
    // Map initialization will happen when modals open
  }

  ngOnDestroy(): void {
    // Clean up maps if needed
    if (this.mapPinMarker) {
      this.mapPinMarker.setMap(null);
    }
    if (this.addressDetailsMarker) {
      this.addressDetailsMarker.setMap(null);
    }
  }

  loadService(): void {
    const serviceId = this.route.snapshot.paramMap.get('id');
    if (!serviceId) {
      this.isLoading = false;
      return;
    }

    this.apiService.getServiceById(serviceId).subscribe({
      next: (service: Service) => {
        this.service = service;
        // Set default duration to first one
        this.selectedDurationIndex = 0;
        this.bookingData.services = [{
          serviceId: service._id,
          quantity: 1,
          durationIndex: 0
        }];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading service:', error);
        this.isLoading = false;
      }
    });
  }

  selectDuration(index: number): void {
    this.selectedDurationIndex = index;
    if (this.service && this.bookingData.services.length > 0) {
      this.bookingData.services[0].durationIndex = index;
    }
  }

  getSelectedDuration(): { duration: number; price: number; discountPrice?: number } | null {
    if (!this.service || !this.service.durations || this.service.durations.length === 0) {
      return null;
    }
    return this.service.durations[this.selectedDurationIndex] || this.service.durations[0];
  }

  initializeDateAndTimeSelection(): void {
    // Generate dates for 2 weeks from today (using UAE timezone)
    this.availableDates = [];
    const now = new Date();

    // Get today's date in UAE timezone
    const uaeTodayString = now.toLocaleDateString('en-CA', {
      timeZone: 'Asia/Dubai'
    }); // Returns YYYY-MM-DD format

    // Parse the UAE today date
    const [year, month, day] = uaeTodayString.split('-').map(Number);

    for (let i = 0; i < 14; i++) {
      // Create date by adding days to today
      const dateObj = new Date(year, month - 1, day + i);

      // Format date in YYYY-MM-DD format for comparison (UAE timezone)
      const yearStr = dateObj.getFullYear();
      const monthStr = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dayStr = String(dateObj.getDate()).padStart(2, '0');
      const dateValue = `${yearStr}-${monthStr}-${dayStr}`;

      // Get day name for display
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = dayNames[dateObj.getDay()];
      const dateNumber = dateObj.getDate().toString();

      this.availableDates.push({
        date: dateObj,
        displayDate: `${dayName} ${dateNumber}`,
        dayName,
        dateNumber,
        dateValue
      });
    }

    // Generate all time slots (every 1 hour from 8:00 to 24:00)
    this.allTimeSlots = [];
    for (let hour = 8; hour < 24; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      this.allTimeSlots.push(`${startTime}-${endTime}`);
    }
    // Add the last slot ending at 24:00 (midnight)
    this.allTimeSlots.push('23:00-24:00');
    // Initially, show all slots (will be filtered when date is selected)
    this.updateAvailableTimeSlots();

    // Set default selected date to today (index 0)
    if (this.availableDates.length > 0) {
      this.selectedDateIndex = 0;
      this.bookingData.bookingDate = this.availableDates[0].dateValue;
      // Update available time slots based on selected date
      this.updateAvailableTimeSlots();
    }

    // Set default selected time to first available slot
    // This is handled by updateAvailableTimeSlots() which is called above
  }

  selectDate(index: number): void {
    this.selectedDateIndex = index;
    if (this.availableDates[index]) {
      this.bookingData.bookingDate = this.availableDates[index].dateValue;
      // Recalculate and filter available time slots when date changes
      this.updateAvailableTimeSlots();
    }
  }

  selectTime(index: number): void {
    this.selectedTimeIndex = index;
    if (this.availableTimeSlots[index]) {
      this.bookingData.bookingTime = this.availableTimeSlots[index].split('-')[0];
    }
  }

  scrollDates(direction: 'left' | 'right'): void {
    const container = document.getElementById('date-scroll-container');
    if (container) {
      const scrollAmount = 200;
      if (direction === 'left') {
        container.scrollLeft -= scrollAmount;
      } else {
        container.scrollLeft += scrollAmount;
      }
    }
  }

  scrollTimes(direction: 'left' | 'right'): void {
    const container = document.getElementById('time-scroll-container');
    if (container) {
      const scrollAmount = 200;
      if (direction === 'left') {
        container.scrollLeft -= scrollAmount;
      } else {
        container.scrollLeft += scrollAmount;
      }
    }
  }

  generateAvailableTimes(): void {
    // Generate time slots from 9 AM to 6 PM, every 30 minutes
    const times = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    this.availableTimes = times;
  }

  updateAvailableTimeSlots(): void {
    // Filter out unavailable time slots based on selected date
    if (!this.bookingData.bookingDate) {
      this.availableTimeSlots = this.allTimeSlots;
      return;
    }

    // Get the currently selected time slot value (before filtering)
    const currentSelectedTime = this.bookingData.bookingTime;

    // Filter slots to only show available ones (based on 2-hour rule for today)
    this.availableTimeSlots = this.allTimeSlots.filter(slot => this.isTimeSlotAvailable(slot));

    // Find the index of the previously selected time in the filtered array
    if (currentSelectedTime) {
      const newIndex = this.availableTimeSlots.findIndex(slot =>
        slot.split('-')[0] === currentSelectedTime
      );

      if (newIndex >= 0) {
        // Selected time is still available, keep it selected
        this.selectedTimeIndex = newIndex;
      } else {
        // Selected time is no longer available, select first available
        if (this.availableTimeSlots.length > 0) {
          this.selectedTimeIndex = 0;
          this.bookingData.bookingTime = this.availableTimeSlots[0].split('-')[0];
        } else {
          this.selectedTimeIndex = -1;
          this.bookingData.bookingTime = '';
        }
      }
    } else {
      // No time was selected, select first available
      if (this.availableTimeSlots.length > 0) {
        this.selectedTimeIndex = 0;
        this.bookingData.bookingTime = this.availableTimeSlots[0].split('-')[0];
      } else {
        this.selectedTimeIndex = -1;
        this.bookingData.bookingTime = '';
      }
    }
  }

  isTimeSlotAvailable(timeSlot: string): boolean {
    if (!this.bookingData.bookingDate) {
      return false;
    }

    // Extract start time from slot (format: "HH:00-HH:00")
    const startTime = timeSlot.split('-')[0];
    const [slotHour, slotMinute] = startTime.split(':').map(Number);

    // Get current date and time in UAE timezone (Asia/Dubai, UTC+4)
    const now = new Date();
    const uaeDateString = now.toLocaleDateString('en-CA', {
      timeZone: 'Asia/Dubai'
    }); // Returns YYYY-MM-DD format

    const uaeTimeString = now.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Dubai',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    // Parse UAE time
    const [currentHour, currentMinute] = uaeTimeString.split(':').map(Number);

    // Check if the selected date is today (in UAE timezone)
    // bookingData.bookingDate is in YYYY-MM-DD format
    const isToday = this.bookingData.bookingDate === uaeDateString;

    if (!isToday) {
      // For future dates, all time slots are available
      return true;
    }

    // For today, calculate the minimum available hour
    // Add 2 hours to current time and round up to next hour
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const twoHoursInMinutes = 2 * 60; // 2 hours = 120 minutes
    const minimumTimeInMinutes = currentTimeInMinutes + twoHoursInMinutes;

    // Round up to the next hour
    const minimumHour = Math.ceil(minimumTimeInMinutes / 60);

    // Time slot is available if its hour is >= the minimum hour
    return slotHour >= minimumHour;
  }

  isValidTimeSelected(): boolean {
    if (this.selectedTimeIndex < 0 || !this.bookingData.bookingTime) {
      return false;
    }
    // Since we filter out unavailable slots, if it's in availableTimeSlots, it's valid
    return this.availableTimeSlots.length > 0 && this.selectedTimeIndex < this.availableTimeSlots.length;
  }

  submitBooking(): void {
    if (!this.service) return;

    // Validate that an address is selected
    if (!this.selectedAddress) {
      alert('Please select an address before proceeding with the booking.');
      this.openAddressSelection();
      return;
    }

    // Validate that a time slot is selected
    if (this.selectedTimeIndex < 0 || !this.bookingData.bookingTime) {
      alert('Please select a time slot.');
      return;
    }

    this.isSubmitting = true;

    // Construct booking date in UAE timezone (UTC+4)
    // The backend expects an ISO 8601 date string
    const dateStr = this.bookingData.bookingDate; // Format: YYYY-MM-DD (UAE date)
    const timeStr = this.bookingData.bookingTime; // Format: HH:MM (UAE time)

    // Create ISO string with UAE timezone offset (+04:00)
    // This ensures the backend receives the correct date/time in UAE timezone
    const bookingDateISO = `${dateStr}T${timeStr}:00+04:00`;

    const bookingRequest: BookingRequest = {
      services: [{
        serviceId: this.service._id,
        quantity: 1,
        durationIndex: this.selectedDurationIndex
      }],
      bookingDate: bookingDateISO,
      bookingTime: timeStr,
      customerNotes: this.bookingData.customerNotes
    };

    console.log('Creating booking with:', {
      bookingDate: dateStr,
      bookingTime: timeStr,
      bookingDateISO: bookingDateISO,
      serviceId: this.service._id
    });

    this.apiService.createBooking(bookingRequest).subscribe({
      next: (booking: any) => {
        this.isSubmitting = false;
        // Redirect to my bookings page with success message
        this.router.navigate(['/my-bookings'], {
          queryParams: {
            success: 'true',
            bookingId: booking._id
          }
        });
      },
      error: (error: any) => {
        console.error('Error creating booking:', error);
        this.isSubmitting = false;

        // Show detailed error message
        const errorMessage = error.error?.message || error.message || 'Failed to create booking. Please try again.';
        alert(errorMessage);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/services']);
  }

  getImageUrl(imagePath: string): string {
    // The imagePath already includes 'uploads/' prefix, so we just prepend the base URL
    return `${environment.apiUrl}/${imagePath}`;
  }

  onImageError(event: any): void {
    // Hide the image if it fails to load
    event.target.style.display = 'none';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Address Selection Methods
  loadAddresses(): void {
    this.apiService.getCustomerProfile().subscribe({
      next: (response) => {
        this.addresses = response.addresses || [];
        // Set default address if available
        const defaultAddress = this.addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          this.selectedAddressIndex = this.addresses.indexOf(defaultAddress);
          this.selectedAddress = defaultAddress;
        } else if (this.addresses.length > 0) {
          // Select first address if no default
          this.selectedAddressIndex = 0;
          this.selectedAddress = this.addresses[0];
        }
        // Always show popup on page load to allow address selection/change
        setTimeout(() => {
          this.showAddressPopup = true;
        }, 500);
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
        // Show popup even if there's an error
        setTimeout(() => {
          this.showAddressPopup = true;
        }, 500);
      }
    });
  }

  loadGoogleMapsScript(): void {
    if (this.mapsScriptLoaded || typeof google !== 'undefined') {
      return;
    }

    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      this.mapsScriptLoaded = true;
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleMapsApiKey}&libraries=places,geocoding`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.mapsScriptLoaded = true;
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps script. Please check your API key.');
    };
    document.head.appendChild(script);
  }

  selectAddress(index: number): void {
    this.selectedAddressIndex = index;
    this.selectedAddress = this.addresses[index];
  }

  confirmAddressSelection(): void {
    if (this.selectedAddressIndex >= 0 && this.selectedAddress) {
      this.showAddressPopup = false;
    }
  }

  openAddressSelection(): void {
    this.showAddressPopup = true;
  }

  closeAddressPopup(): void {
    // Don't allow closing if no address is selected - address is compulsory
    if (!this.selectedAddress) {
      return;
    }
    this.showAddressPopup = false;
  }

  openAddNewAddress(): void {
    this.showAddressPopup = false;
    this.showMapPinModal = true;
    this.mapSearchQuery = '';
    this.confirmedPinLocation = null;

    setTimeout(() => {
      if (this.mapsScriptLoaded || typeof google !== 'undefined') {
        this.initMapPin();
      } else {
        this.loadGoogleMapsScript();
        // Wait for script to load
        const checkScript = setInterval(() => {
          if (this.mapsScriptLoaded || typeof google !== 'undefined') {
            clearInterval(checkScript);
            this.initMapPin();
          }
        }, 100);
      }
    }, 100);
  }

  closeMapPinModal(): void {
    this.showMapPinModal = false;
    if (this.mapPinMarker) {
      this.mapPinMarker.setMap(null);
      this.mapPinMarker = null;
    }
    if (this.mapPin) {
      this.mapPin = null;
    }
    // Reopen address selection popup if no address is selected
    if (!this.selectedAddress) {
      this.showAddressPopup = true;
    }
  }

  initMapPin(): void {
    if (!this.mapPinContainer || typeof google === 'undefined') {
      return;
    }

    this.isMapLoading = true;
    const defaultLocation = { lat: 25.2048, lng: 55.2708 }; // Dubai, UAE

    this.mapPin = new google.maps.Map(this.mapPinContainer.nativeElement, {
      center: defaultLocation,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    this.mapPinGeocoder = new google.maps.Geocoder();

    this.mapPinMarker = new google.maps.Marker({
      map: this.mapPin,
      position: defaultLocation,
      draggable: true,
      animation: google.maps.Animation.DROP
    });

    google.maps.event.addListener(this.mapPinMarker, 'dragend', () => {
      this.reverseGeocodePin(this.mapPinMarker.getPosition());
    });

    google.maps.event.addListener(this.mapPin, 'click', (event: any) => {
      this.mapPinMarker.setPosition(event.latLng);
      this.reverseGeocodePin(event.latLng);
    });

    this.isMapLoading = false;
  }

  reverseGeocodePin(location: { lat: () => number; lng: () => number }): void {
    if (!this.mapPinGeocoder) return;

    const latlng = {
      lat: location.lat(),
      lng: location.lng()
    };

    this.mapPinGeocoder.geocode({ location: latlng }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        // Store the location for later use
        this.confirmedPinLocation = latlng;
      }
    });
  }

  setMyLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          if (this.mapPin && this.mapPinMarker) {
            this.mapPin.setCenter(location);
            this.mapPinMarker.setPosition(location);
            this.reverseGeocodePin(this.mapPinMarker.getPosition());
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please search for an address instead.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }

  searchMapLocation(): void {
    if (!this.mapSearchQuery.trim() || !this.mapPinGeocoder) return;

    this.mapPinGeocoder.geocode({ address: this.mapSearchQuery }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();

        this.mapPin.setCenter({ lat, lng });
        this.mapPinMarker.setPosition({ lat, lng });
        this.confirmedPinLocation = { lat, lng };
      } else {
        alert('Location not found. Please try a different search term.');
      }
    });
  }

  confirmPinLocation(): void {
    if (!this.mapPinMarker) return;

    const position = this.mapPinMarker.getPosition();
    this.confirmedPinLocation = {
      lat: position.lat(),
      lng: position.lng()
    };

    // Reverse geocode to get address
    if (this.mapPinGeocoder) {
      this.mapPinGeocoder.geocode({ location: this.confirmedPinLocation }, (results: any[], status: string) => {
        if (status === 'OK' && results[0]) {
          this.parseAddressComponents(results[0]);
          this.showMapPinModal = false;
          this.showAddressDetailsModal = true;

          setTimeout(() => {
            this.initAddressDetailsMap();
          }, 100);
        }
      });
    }
  }

  parseAddressComponents(result: any): void {
    const addressComponents = result.address_components;
    let streetNumber = '';
    let route = '';
    let locality = '';
    let administrativeAreaLevel1 = '';
    let sublocality = '';
    let premise = '';

    addressComponents.forEach((component: any) => {
      const types = component.types;
      if (types.includes('street_number')) streetNumber = component.long_name;
      if (types.includes('route')) route = component.long_name;
      if (types.includes('locality')) locality = component.long_name;
      if (types.includes('administrative_area_level_1')) administrativeAreaLevel1 = component.long_name;
      if (types.includes('sublocality') || types.includes('sublocality_level_1')) sublocality = component.long_name;
      if (types.includes('premise')) premise = component.long_name;
    });

    const uaeCityMap: { [key: string]: string } = {
      'Dubai': 'Dubai',
      'Abu Dhabi': 'Abu Dhabi',
      'Sharjah': 'Sharjah',
      'Ajman': 'Ajman',
      'Umm Al Quwain': 'Umm Al Quwain',
      'Ras Al Khaimah': 'Ras Al Khaimah',
      'Fujairah': 'Fujairah'
    };

    let city = 'Dubai';
    if (locality && uaeCityMap[locality]) {
      city = locality;
    } else if (administrativeAreaLevel1 && uaeCityMap[administrativeAreaLevel1]) {
      city = administrativeAreaLevel1;
    }

    const streetAddress = [streetNumber, route].filter(Boolean).join(' ');

    // Ensure we have values for required fields
    const finalStreet = route || streetAddress || result.formatted_address.split(',')[0] || '';
    const finalBuilding = premise || streetNumber || result.formatted_address.split(',')[0] || '';
    const finalRegion = sublocality || locality || administrativeAreaLevel1 || city || '';

    this.addressForm.patchValue({
      fullAddress: result.formatted_address,
      street: finalStreet,
      building: finalBuilding,
      region: finalRegion,
      city: city,
      country: 'UAE'
    });
  }

  initAddressDetailsMap(): void {
    if (!this.addressDetailsMapContainer || !this.confirmedPinLocation || typeof google === 'undefined') {
      return;
    }

    this.addressDetailsMap = new google.maps.Map(this.addressDetailsMapContainer.nativeElement, {
      center: this.confirmedPinLocation,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    this.addressDetailsMarker = new google.maps.Marker({
      map: this.addressDetailsMap,
      position: this.confirmedPinLocation,
      draggable: false
    });
  }

  closeAddressDetailsModal(): void {
    this.showAddressDetailsModal = false;
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
      isDefault: false,
      label: ''
    });
    if (this.addressDetailsMarker) {
      this.addressDetailsMarker.setMap(null);
      this.addressDetailsMarker = null;
    }
    if (this.addressDetailsMap) {
      this.addressDetailsMap = null;
    }
    // Reopen address selection popup if no address is selected
    if (!this.selectedAddress) {
      this.showAddressPopup = true;
    }
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

    this.isSavingAddress = true;
    const addressData = this.addressForm.value;
    addressData.isDefault = this.addresses.length === 0; // Set as default if it's the first address

    this.apiService.addAddress(addressData).subscribe({
      next: () => {
        this.isSavingAddress = false;
        this.loadAddresses();
        this.closeAddressDetailsModal();
        // Select the newly added address
        setTimeout(() => {
          if (this.addresses.length > 0) {
            this.selectedAddressIndex = this.addresses.length - 1;
            this.selectedAddress = this.addresses[this.selectedAddressIndex];
          }
        }, 100);
      },
      error: (error) => {
        console.error('Error saving address:', error);
        this.isSavingAddress = false;
        alert(error.error?.message || 'Failed to save address. Please try again.');
      }
    });
  }

  getAddressLabel(address: Address): string {
    if (address.type === 'Other' && address.label) {
      return address.label;
    }
    return address.type;
  }
}
