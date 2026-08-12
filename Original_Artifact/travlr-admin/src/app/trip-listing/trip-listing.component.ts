import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TripCardComponent } from '../trip-card/trip-card.component';
import { TripDataService } from '../services/trip-data.service';
import { Trip } from '../models/trip';

@Component({
  selector: 'app-trip-listing',
  standalone: true,
  imports: [CommonModule, RouterLink, TripCardComponent],
  templateUrl: './trip-listing.html',
  styleUrl: './trip-listing.css'
})
export class TripListingComponent implements OnInit {
  trips: Trip[] = [];
  loadError: string | null = null;

  constructor(private tripDataService: TripDataService) {}

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.tripDataService.getTrips().subscribe({
      next: (data) => {
        this.trips = data;
        this.loadError = null;
      },
      error: (err) => {
        console.error('Error loading trips:', err);
        this.loadError = 'Unable to load trips right now.';
      }
    });
  }

  onDeleteTrip(code: string): void {
    this.tripDataService.deleteTrip(code).subscribe({
      next: () => this.loadTrips(),
      error: (err) => {
        console.error('Error deleting trip:', err);
        this.loadError = 'Unable to delete that trip right now.';
      }
    });
  }
}