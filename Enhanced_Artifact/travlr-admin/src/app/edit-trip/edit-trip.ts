import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TripDataService } from '../services/trip-data.service';

@Component({
  selector: 'app-edit-trip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-trip.html',
  styleUrl: './edit-trip.css'
})
export class EditTrip implements OnInit {
  tripForm: FormGroup;
  tripCode = '';
  loadError: string | null = null;
  submitError: string | null = null;
  isLoading = true;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private tripDataService: TripDataService
  ) {
    this.tripForm = this.fb.group({
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      length: ['', [Validators.required]],
      start: ['', [Validators.required]],
      resort: ['', [Validators.required]],
      perPerson: ['', [Validators.required, Validators.min(0)]],
      image: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });
  }

  get f() {
    return this.tripForm.controls;
  }

  ngOnInit(): void {
    this.tripCode = this.route.snapshot.paramMap.get('code') || '';

    if (!this.tripCode) {
      this.isLoading = false;
      this.loadError = 'No trip code was provided.';
      return;
    }

    this.tripDataService.getTrip(this.tripCode).subscribe({
      next: (trip) => {
        this.tripForm.patchValue(trip);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.loadError = 'Unable to load this trip.';
      }
    });
  }

  onSubmit(): void {
    this.submitError = null;

    if (this.tripForm.invalid) {
      this.tripForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.tripDataService.updateTrip(this.tripCode, this.tripForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err?.error?.message || 'Something went wrong updating this trip.';
      }
    });
  }

  onDelete(): void {
    if (!confirm(`Delete trip "${this.tripCode}"? This cannot be undone.`)) {
      return;
    }

    this.tripDataService.deleteTrip(this.tripCode).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.submitError = 'Something went wrong deleting this trip.';
      }
    });
  }
}
