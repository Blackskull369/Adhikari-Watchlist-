import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';                 
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MovieStoreService } from '../services/movie-store.service';
import { NotificationService } from '../services/notification.service';
import { Movie } from '../models/movie.model';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';     

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
  private router = inject(Router);
  private dialog = inject(MatDialog);                                  

  stars = [1, 2, 3, 4, 5];

  movies = signal<Movie[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedIds = signal<(number | string)[]>([]);

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

  edit(movie: Movie) {
    this.router.navigate(['/watchlist/edit', movie.id]);
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

  
  private askToConfirm(title: string, message: string) {
    return this.dialog
      .open(ConfirmDialog, {
        width: '1000px',
        data: { title, message, confirmText: 'Delete' },
      })
      .afterClosed();
  }

  
  remove(movie: Movie) {
    this.askToConfirm('Remove movie?', `Remove "${movie.title}" from your watchlist?`)
      .subscribe(confirmed => {
        if (!confirmed) {
          return;
        }

        this.store.delete(movie.id!).subscribe({
          next: () => {
            this.movies.update(list => list.filter(m => m.id !== movie.id));
            this.selectedIds.update(list => list.filter(x => x !== movie.id));
            this.notify.success('Movie removed');
          },
          error: () => this.notify.error('Could not remove the movie'),
        });
      });
  }

  onCheckBoxChange(id: number | string | undefined, checked: boolean) {
    if (id === undefined) {
      return;
    }

    if (checked) {
      this.selectedIds.update(list => [...list, id]);
    } else {
      this.selectedIds.update(list => list.filter(x => x !== id));
    }
  }

  
  removeSelected() {
    const ids = this.selectedIds();

    if (ids.length === 0) {
      this.notify.error('Select at least one movie first');
      return;
    }

    this.askToConfirm(
      'Remove selected movies?',
      `Remove ${ids.length} selected movie(s) from your watchlist?`,
    ).subscribe(confirmed => {
      if (!confirmed) {
        return;
      }

      forkJoin(ids.map(id => this.store.delete(id))).subscribe({
        next: () => {
          this.movies.update(list => list.filter(m => !ids.includes(m.id!)));
          this.selectedIds.set([]);
          this.notify.success(`${ids.length} movie(s) removed`);
        },
        error: () => this.notify.error('Could not remove the selected movies'),
      });
    });
  }

  private replaceMovie(updated: Movie) {
    this.movies.update(list => list.map(m => (m.id === updated.id ? updated : m)));
  }
}