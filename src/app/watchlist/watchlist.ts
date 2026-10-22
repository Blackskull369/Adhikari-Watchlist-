import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MovieStoreService } from '../services/movie-store.service';
import { NotificationService } from '../services/notification.service';
import { Movie } from '../models/movie.model';

@Component({
  selector: 'app-watchlist',
  imports: [
    MatCardModule, MatButtonModule, MatButtonToggleModule, MatCheckboxModule,
    MatChipsModule, MatFormFieldModule, MatIconModule, MatProgressBarModule,
    MatSelectModule, MatSlideToggleModule, MatTooltipModule,
  ],
  templateUrl: './watchlist.html',
  styleUrl: './watchlist.scss',
})
export class Watchlist implements OnInit {
  private store = inject(MovieStoreService);
  private notify = inject(NotificationService);

  stars = [1, 2, 3, 4, 5];

  movies = signal<Movie[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedids:number[] = [];

  ngOnInit() {
 
    this.loadMovies();
  }

  loadMovies() {
    this.loading.set(true);
    this.error.set(null);

    this.store.getAll().subscribe({
      next: data => {
        this.movies.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load your watchlist. Is the API running?');
        this.loading.set(false);
        this.notify.error('Failed to load your watchlist');
      },
    });
  }

  toggleWatched(movie: Movie) {
    this.store.update(movie.id!, { watched: !movie.watched }).subscribe({
      next: updated => {
        this.replaceMovie(updated);
        this.notify.success(updated.watched ? 'Marked as watched' : 'Marked as unwatched');
      },
      error: () => this.notify.error('Could not update the movie'),
    });
  }

  setRating(movie: Movie, rating: number) {
    this.store.update(movie.id!, { rating }).subscribe({
      next: updated => {
        this.replaceMovie(updated);
        this.notify.success('Rating saved');
      },
      error: () => this.notify.error('Could not save your rating'),
    });
  }

  remove(movie: Movie) {
    this.store.delete(movie.id!).subscribe({
      next: () => {
        this.movies.update(list => list.filter(m => m.id !== movie.id));
        this.notify.success('Movie removed');
      },
      error: () => this.notify.error('Could not remove the movie'),
    });
  }

  private replaceMovie(updated: Movie) {
    this.movies.update(list => list.map(m => (m.id === updated.id ? updated : m)));
  }
  
  
  onCheckBoxChange(id:any, isChecked:boolean){
    if (isChecked) {
       this.selectedids.push(id)
    }
    else {
      this.selectedids = this.selectedids.filter(i => i !== id); 
    }
  }

  removeSelected() {
    if (this.selectedids.length === 0) {
      this.notify.error('No movies selected');
      return; 
    }

    this.selectedids.forEach(id => {
      this.store.delete(id).subscribe({
        next: () => {
          this.movies.update(list => list.filter(m => m.id !== id));
        },
        error: () => this.notify.error('Could not remove one of the movies')
      });
    });

    this.selectedids = [];
    this.notify.success('Selected movies removed');
  }

}