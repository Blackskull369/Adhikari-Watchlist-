import { Component, inject, OnInit, signal } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { MovieApiService } from '../services/movie-api.service';
import { MovieStoreService } from '../services/movie-store.service';
import { NotificationService } from '../services/notification.service';
import { RuntimeFormatPipe } from '../pipes/runtime-format.pipe';
import { Movie } from '../models/movie.model';

@Component({
  selector: 'app-movie-detail',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule, RuntimeFormatPipe],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.scss',
})
export class MovieDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private api = inject(MovieApiService);
  private store = inject(MovieStoreService);
  private notify = inject(NotificationService);

  movie = signal<Movie | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  saved = signal(false);
  adding = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('No movie selected.');
      this.loading.set(false);
      return;
    }

    this.api.getDetails(id).subscribe({
      next: movie => {
        this.movie.set(movie);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load this movie. Check your connection and API key.');
        this.loading.set(false);
      },
    });

    
    this.store.getAll().subscribe({
      next: list => this.saved.set(list.some(m => m.imdbId === id)),
    });
  }

  add() {
    const movie = this.movie();

    if (!movie || this.saved() || this.adding()) {
      return;
    }

    this.adding.set(true);

    this.store.add(movie).subscribe({
      next: () => {
        this.saved.set(true);
        this.adding.set(false);
        this.notify.success(`"${movie.title}" added to your watchlist`);
      },
      error: () => {
        this.adding.set(false);
        this.notify.error('Could not add the movie. Please try again.');
      },
    });
  }

  back() {
    this.location.back();
  }
}