import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Service, BookingRequest } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

            <div class="flex justify-between items-center mb-4">
              <span class="text-2xl font-bold text-primary-600">AED {{ service.price }}</span>
              <span class="text-sm text-gray-500">{{ service.duration }} minutes</span>
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
              <!-- Date Selection -->
              <div class="mb-6">
                <label for="bookingDate" class="block text-sm font-medium text-gray-700 mb-2">
                  Select Date *
                </label>
                <input
                  type="date"
                  id="bookingDate"
                  name="bookingDate"
                  [(ngModel)]="bookingData.bookingDate"
                  #dateInput="ngModel"
                  required
                  [min]="minDate"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <div *ngIf="dateInput.invalid && dateInput.touched" class="mt-1 text-sm text-red-600">
                  Please select a valid date
                </div>
              </div>

              <!-- Time Selection -->
              <div class="mb-6">
                <label for="bookingTime" class="block text-sm font-medium text-gray-700 mb-2">
                  Select Time *
                </label>
                <select
                  id="bookingTime"
                  name="bookingTime"
                  [(ngModel)]="bookingData.bookingTime"
                  #timeInput="ngModel"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Choose a time</option>
                  <option *ngFor="let time of availableTimes" [value]="time">{{ time }}</option>
                </select>
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
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Service:</span>
                  <span>{{ service.name }}</span>
                </div>
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Duration:</span>
                  <span>{{ service.duration }} minutes</span>
                </div>
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Price:</span>
                  <span>AED {{ service.price }}</span>
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
                [disabled]="!bookingForm.valid || isSubmitting"
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
  `,
  styles: []
})
export class BookingComponent implements OnInit {
  service: Service | null = null;
  isLoading = true;
  isSubmitting = false;
  minDate = '';
  availableTimes: string[] = [];

  bookingData: BookingRequest = {
    services: [],
    bookingDate: '',
    bookingTime: '',
    customerNotes: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    // Set minimum date to today
    this.minDate = new Date().toISOString().split('T')[0];

    // Load service details
    this.loadService();

    // Generate available times
    this.generateAvailableTimes();
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
        this.bookingData.services = [{
          serviceId: service._id,
          quantity: 1
        }];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading service:', error);
        this.isLoading = false;
      }
    });
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

  submitBooking(): void {
    if (!this.service) return;

    this.isSubmitting = true;

    // Convert date to ISO string
    const bookingDate = new Date(this.bookingData.bookingDate + 'T' + this.bookingData.bookingTime + ':00');

    const bookingRequest: BookingRequest = {
      services: [{
        serviceId: this.service._id,
        quantity: 1
      }],
      bookingDate: bookingDate.toISOString(),
      bookingTime: this.bookingData.bookingTime,
      customerNotes: this.bookingData.customerNotes
    };

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
        alert('Failed to create booking. Please try again.');
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
}
