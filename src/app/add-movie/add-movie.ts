import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MovieStoreService } from '../services/movie-store.service';
import { NotificationService } from '../services/notification.service';
import { Movie } from '../models/movie.model';


function ratingRequiredWhenWatched(group: AbstractControl): ValidationErrors | null {
  const watched = group.get('watched')?.value;
  const rating = group.get('rating')?.value;
  return watched && !rating ? { ratingRequired: true } : null;
}

@Component({
  selector: 'app-add-movie',
  imports: [
    ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatSlideToggleModule, MatButtonModule, MatIconModule,
  ],
  templateUrl: './add-movie.html',
  styleUrl: './add-movie.scss',
})
export class AddMovie {
  private fb = inject(FormBuilder);
  private store = inject(MovieStoreService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Documentary', 'Other'];
  stars = [1, 2, 3, 4, 5];
  maxYear = new Date().getFullYear() + 5;

  saving = signal(false);
  submitted = signal(false);

  form = this.fb.nonNullable.group(
    {
      title: ['', [Validators.required, Validators.minLength(2)]],
      year: this.fb.control<number | null>(null, [
        Validators.required,
        Validators.min(1888),
        Validators.max(this.maxYear),
        Validators.pattern(/^\d+$/),
      ]),
      director: ['', [Validators.required]],
      genre: ['', [Validators.required]],
      runtime: this.fb.control<number | null>(null, [
        Validators.required,
        Validators.min(1),
        Validators.max(600),
        Validators.pattern(/^\d+$/),
      ]),
      posterUrl: ['', [Validators.pattern(/^https?:\/\/\S+\.\S+$/)]],
      plot: ['', [Validators.maxLength(1000)]],
      watched: [false],
      rating: this.fb.control<number | null>(null, [Validators.min(1), Validators.max(5)]),
    },
    { validators: ratingRequiredWhenWatched },
  );

  setRating(value: number) {
    this.form.controls.rating.setValue(value);
  }

  save() {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    const movie: Movie = {
      source: 'manual',
      title: v.title.trim(),
      year: v.year!,
      director: v.director.trim(),
      genre: v.genre,
      runtime: v.runtime!,
      posterUrl: v.posterUrl.trim() || null,
      plot: v.plot.trim() || null,
      watched: v.watched,
      rating: v.rating,
      imdbRating: null,
      imdbId: null,
      addedAt: new Date().toISOString(),
    };

    this.saving.set(true);

    this.store.add(movie).subscribe({
      next: () => {
        this.notify.success(`"${movie.title}" added to your watchlist`);
        this.router.navigate(['/watchlist']);
      },
      error: () => {
        this.saving.set(false);
        this.notify.error('Could not save the movie. Is the API running?');
      },
    });
  }

  cancel() {
    this.router.navigate(['/watchlist']);
  }
}