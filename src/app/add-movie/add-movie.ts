import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
export class AddMovie implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(MovieStoreService);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  editId = this.route.snapshot.paramMap.get('id');

  genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Documentary', 'Other'];
  stars = [1, 2, 3, 4, 5];
  maxYear = new Date().getFullYear() + 5;

  saving = signal(false);
  submitted = signal(false);
  isApiMovie = signal(false);                                   // NEW

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

  ngOnInit() {
    if (!this.editId) {
      return;
    }

    this.store.getById(this.editId).subscribe({
      next: movie => {
        this.form.patchValue({
          title: movie.title,
          year: movie.year,
          director: movie.director,
          genre: movie.genre,
          runtime: movie.runtime,
          posterUrl: movie.posterUrl ?? '',
          plot: movie.plot ?? '',
          watched: movie.watched,
          rating: movie.rating,
        });

        // NEW: movies from the public API are read-only, except watched and rating
        if (movie.source === 'api') {
          this.isApiMovie.set(true);
          this.form.controls.title.disable();
          this.form.controls.year.disable();
          this.form.controls.director.disable();
          this.form.controls.genre.disable();
          this.form.controls.runtime.disable();
          this.form.controls.posterUrl.disable();
          this.form.controls.plot.disable();
        }
      },
      error: () => {
        this.notify.error('Could not load this movie');
        this.router.navigate(['/watchlist']);
      },
    });
  }

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

    const values = {
      title: v.title.trim(),
      year: v.year!,
      director: v.director.trim(),
      genre: v.genre,
      runtime: v.runtime!,
      posterUrl: v.posterUrl.trim() || null,
      plot: v.plot.trim() || null,
      watched: v.watched,
      rating: v.rating,
    };

    this.saving.set(true);

    if (this.editId) {
      // NEW: an API movie may only change watched and rating
      const changes = this.isApiMovie()
        ? { watched: v.watched, rating: v.rating }
        : values;

      this.store.update(this.editId, changes).subscribe({
        next: () => {
          this.notify.success('Movie updated');
          this.router.navigate(['/watchlist']);
        },
        error: () => {
          this.saving.set(false);
          this.notify.error('Could not update the movie');
        },
      });
    } else {
      const movie: Movie = {
        ...values,
        source: 'manual',
        imdbRating: null,
        imdbId: null,
        addedAt: new Date().toISOString(),
      };

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
  }

  cancel() {
    this.router.navigate(['/watchlist']);
  }
}