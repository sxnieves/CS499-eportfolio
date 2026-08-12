import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TripDataService } from '../services/trip-data.service';

@Component({
  selector: 'app-add-trip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-trip.html',
  styleUrl: './add-trip.css'
})
export class AddTrip {
  tripForm: FormGroup;
  submitError: string | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private tripDataService: TripDataService,
    private router: Router
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

  onSubmit(): void {
    this.submitError = null;

    if (this.tripForm.invalid) {
      this.tripForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.tripDataService.addTrip(this.tripForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err?.error?.message || 'Something went wrong adding this trip.';
      }
    });
  }
}
