import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Booking } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p class="mt-2 text-gray-600">Manage your service bookings</p>
        </div>

        <div *ngIf="isLoading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p class="mt-2 text-gray-600">Loading your bookings...</p>
        </div>

        <div *ngIf="!isLoading && bookings.length === 0" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p class="text-gray-600 mb-4">Start by booking a service to see your appointments here.</p>
          <a routerLink="/services" class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
            Browse Services
          </a>
        </div>

        <div *ngIf="!isLoading && bookings.length > 0" class="space-y-6">
          <div *ngFor="let booking of bookings" class="bg-white rounded-lg shadow-md p-6">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Booking #{{ booking._id.slice(-8) }}</h3>
                <p class="text-sm text-gray-600">{{ formatDate(booking.bookingDate) }} at {{ booking.bookingTime }}</p>
              </div>
              <span [class]="getStatusClass(booking.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ booking.status }}
              </span>
            </div>

            <div class="mb-4">
              <h4 class="font-medium text-gray-900 mb-2">Services:</h4>
              <div class="space-y-2">
                <div *ngFor="let service of booking.services" class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p class="font-medium text-gray-900">{{ service.serviceName }}</p>
                    <p class="text-sm text-gray-600">Quantity: {{ service.quantity }}</p>
                  </div>
                  <span class="font-medium text-gray-900">{{ 'AED ' + service.price }}</span>
                </div>
              </div>
            </div>

            <div class="flex justify-between items-center mb-4">
              <div>
                <p class="text-sm text-gray-600">Total Amount:</p>
                <p class="text-lg font-semibold text-gray-900">{{ 'AED ' + booking.totalAmount }}</p>
              </div>
              <div *ngIf="booking.customerNotes">
                <p class="text-sm text-gray-600">Notes:</p>
                <p class="text-sm text-gray-900">{{ booking.customerNotes }}</p>
              </div>
            </div>

            <div class="flex justify-end space-x-3">
              <button 
                *ngIf="booking.status === 'PENDING'"
                (click)="cancelBooking(booking._id)"
                [disabled]="isCancelling"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {{ isCancelling ? 'Cancelling...' : 'Cancel Booking' }}
              </button>
              <button 
                (click)="viewBookingDetails(booking)"
                class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  isLoading = true;
  isCancelling = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadBookings();
  }

  loadBookings(): void {
    this.apiService.getMyBookings().subscribe({
      next: (bookings: Booking[]) => {
        this.bookings = bookings;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading bookings:', error);
        this.isLoading = false;
      }
    });
  }

  cancelBooking(bookingId: string): void {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.isCancelling = true;
      this.apiService.cancelBooking(bookingId).subscribe({
        next: (booking: any) => {
          this.isCancelling = false;
          this.loadBookings(); // Reload to get updated status
        },
        error: (error: any) => {
          this.isCancelling = false;
          console.error('Error cancelling booking:', error);
          alert('Failed to cancel booking. Please try again.');
        }
      });
    }
  }

  viewBookingDetails(booking: Booking): void {
    // For now, just show an alert with booking details
    alert(`Booking Details:\n\nID: ${booking._id}\nDate: ${this.formatDate(booking.bookingDate)}\nTime: ${booking.bookingTime}\nStatus: ${booking.status}\nTotal: AED ${booking.totalAmount}`);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}