import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ServicesComponent } from './components/services/services.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MyBookingsComponent } from './components/my-bookings/my-bookings.component';
import { BookingComponent } from './components/booking/booking.component';
import { AddressesComponent } from './components/addresses/addresses.component';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'services/:category', component: ServicesComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'booking/:id', component: BookingComponent },
  { path: 'my-bookings', component: MyBookingsComponent },
  { path: 'addresses', component: AddressesComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: '' }
];
