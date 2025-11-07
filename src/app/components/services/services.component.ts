import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, Service, ServiceCategory } from '../../services/api.service';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Hero Section -->
      <div class="bg-primary-600 text-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center">
            <h2 class="text-4xl font-bold mb-4">Discover Our Services</h2>
            <p class="text-xl text-primary-100 max-w-2xl mx-auto">
              Book professional services tailored to your needs. From wellness to beauty, we have everything you need.
            </p>
          </div>
        </div>
      </div>

      <!-- Services Grid -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div *ngIf="isLoading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p class="mt-2 text-gray-600">Loading services...</p>
        </div>

        <div *ngIf="!isLoading && services.length === 0" class="text-center py-12">
          <div class="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No services available</h3>
          <p class="text-gray-500">Check back later for new services.</p>
        </div>

        <div *ngIf="!isLoading && services.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let service of services" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div class="h-48 bg-gray-200">
              <img 
                *ngIf="service.images && service.images.length > 0"
                [src]="getImageUrl(service.images[0])" 
                [alt]="service.name"
                class="w-full h-full object-cover"
                (error)="onImageError($event)"
              />
              <img 
                *ngIf="!service.images || service.images.length === 0"
                [src]="getFallbackImageUrl()" 
                [alt]="service.name"
                class="w-full h-full object-cover"
              />
            </div>
            
            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ service.name }}</h3>
              <p class="text-gray-600 mb-4">{{ service.description || 'No description available' }}</p>
              
              <div class="mb-4">
                <div class="flex flex-wrap gap-2 mb-2">
                  <span *ngFor="let duration of service.durations; let i = index" 
                        class="px-3 py-1 bg-gray-100 rounded-md text-sm">
                    {{ duration.duration }} min - 
                    <span *ngIf="duration.discountPrice !== undefined && duration.discountPrice !== null">
                      <span class="line-through text-gray-500 mr-1">{{ 'AED ' + duration.price }}</span>
                      <span class="text-green-600 font-semibold">{{ 'AED ' + duration.discountPrice }}</span>
                    </span>
                    <span *ngIf="!duration.discountPrice">{{ 'AED ' + duration.price }}</span>
                  </span>
                </div>
              </div>
              
              <div class="grid grid-cols-3 gap-2 text-sm">
                <a [href]="'tel:+971521608488'" class="text-center border rounded-md py-2 hover:bg-gray-50">Call</a>
                <a [href]="'https://wa.me/971521608488'" target="_blank" class="text-center border rounded-md py-2 hover:bg-gray-50">WhatsApp</a>
                <button
                  (click)="bookService(service)"
                  class="bg-primary-600 hover:bg-primary-700 text-white rounded-md py-2"
                >
                  Book
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ServicesComponent implements OnInit {
  services: Service[] = [];
  categories: ServiceCategory[] = [];
  isLoading = true;
  selectedCategory: string | null = null;

  constructor(
    private apiService: ApiService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get initial route params
    this.selectedCategory = this.route.snapshot.params['category'] || null;
    
    // Load categories first
    this.loadCategories();
    
    // Subscribe to route param changes
    this.route.params.subscribe(params => {
      this.selectedCategory = params['category'] || null;
      // Only load services if categories are already loaded
      if (this.categories.length > 0) {
        this.loadServices();
      }
      // Otherwise, loadServices will be called after categories are loaded
    });
  }

  loadCategories(): void {
    this.apiService.getServiceCategories().subscribe({
      next: (categories: ServiceCategory[]) => {
        this.categories = categories;
        // After categories are loaded, load services with the current category filter
        this.loadServices();
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
        // Still load services even if categories fail (will show all services)
        this.loadServices();
      }
    });
  }

  loadServices(): void {
    this.isLoading = true;
    
    let categoryId: string | undefined;
    
    // If a category name is provided in route params, find the matching category ID
    if (this.selectedCategory) {
      // Try to find by slug first (more reliable)
      let category = this.categories.find(
        cat => cat.slug?.toLowerCase() === this.selectedCategory?.toLowerCase()
      );
      
      // If not found by slug, try by name
      if (!category) {
        category = this.categories.find(
          cat => cat.name.toLowerCase() === this.selectedCategory?.toLowerCase()
        );
      }
      
      if (category) {
        categoryId = category._id;
      }
    }

    this.apiService.getServices(categoryId).subscribe({
      next: (services: Service[]) => {
        this.services = services;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading services:', error);
        this.isLoading = false;
      }
    });
  }

  bookService(service: Service): void {
    this.router.navigate(['/booking', service._id]);
  }

  getImageUrl(imagePath: string): string {
    // The imagePath already includes 'uploads/' prefix, so we just prepend the base URL
    return `${environment.apiUrl}/${imagePath}`;
  }

  getFallbackImageUrl(): string {
    // Use a sample image that we know exists in production
    return `${environment.apiUrl}/uploads/services/sample-service-4f92451f-ba21-4227-bcae-f249e10b9d3d.png`;
  }

  onImageError(event: any): void {
    // Set fallback image if the original image fails to load
    event.target.src = this.getFallbackImageUrl();
  }
}