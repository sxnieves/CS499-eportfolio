import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Trip } from '../models/trip';

@Component({
  selector: 'app-trip-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './trip-card.html',
  styleUrl: './trip-card.css'
})
export class TripCardComponent {
  @Input() trip!: Trip;
  @Output() deleteTrip = new EventEmitter<string>();

  onDelete(): void {
    if (confirm(`Delete trip "${this.trip.code}"? This cannot be undone.`)) {
      this.deleteTrip.emit(this.trip.code);
    }
  }
}