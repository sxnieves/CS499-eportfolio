import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { TripCardComponent } from '../trip-card/trip-card.component';
import { TripDataService } from '../services/trip-data.service';
import { Trip } from '../models/trip';

@Component({
  selector: 'app-trip-listing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TripCardComponent],
  templateUrl: './trip-listing.html',
  styleUrl: './trip-listing.css'
})
export class TripListingComponent implements OnInit, OnDestroy {
  trips: Trip[] = [];
  loadError: string | null = null;
  searchTerm = '';

  // Algorithms and Data Structure enhancement: search terms are pushed
  // into this Subject rather than triggering an HTTP call on every
  // keystroke. debounceTime + distinctUntilChanged collapse rapid
  // keystrokes into a single request once typing pauses, and
  // switchMap cancels any in-flight search if a newer one comes in.
  // This avoids the O(keystrokes) burst of redundant network calls and
  // wasted server-side work that a naive "search on every change" handler
  // would produce.
  private searchTerms = new Subject<string>();

  constructor(private tripDataService: TripDataService) {}

  ngOnInit(): void {
    this.loadTrips();

    this.searchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => this.tripDataService.searchTrips(term))
      )
      .subscribe({
        next: (data) => {
          // Database enhancement (Milestone Four): searchTrips now returns
          // a paginated page object rather than a bare array.
          this.trips = data.trips;
          this.loadError = null;
        },
        error: (err) => {
          console.error('Error searching trips:', err);
          this.loadError = 'Unable to search trips right now.';
        }
      });
  }

  ngOnDestroy(): void {
    this.searchTerms.complete();
  }

  loadTrips(): void {
    this.tripDataService.getTrips().subscribe({
      next: (data) => {
        // Database enhancement (Milestone Four): the API now returns a
        // page object ({ trips, page, total, ... }) instead of a bare
        // array, so the list itself is the .trips property.
        this.trips = data.trips;
        this.loadError = null;
      },
      error: (err) => {
        console.error('Error loading trips:', err);
        this.loadError = 'Unable to load trips right now.';
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.searchTerms.next(term);
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