import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
import { RuntimeFormatPipe } from '../pipes/runtime-format.pipe';

@Component({
  selector: 'app-watchlist',
  imports: [
    MatCardModule, MatButtonModule, MatButtonToggleModule, MatCheckboxModule,
    MatChipsModule, MatFormFieldModule, MatIconModule, MatProgressBarModule,
    MatSelectModule, MatSlideToggleModule, MatTooltipModule, RuntimeFormatPipe,
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

  // Filter and sort choices
  statusFilter = signal<'all' | 'watched' | 'unwatched'>('all');
  sourceFilter = signal<'all' | 'api' | 'manual'>('all');
  ratingFilter = signal<string>('all');
  yearFilter = signal<string>('all');
  sortBy = signal<string>('added');

  // Years that exist in the list, newest first (for the year dropdown)
  years = computed(() => {
    const unique = new Set(this.movies().map(m => m.year));
    return [...unique].sort((a, b) => b - a);
  });

  // The list the screen shows: all movies, filtered, then sorted
  visibleMovies = computed(() => {
    const status = this.statusFilter();
    const source = this.sourceFilter();
    const rating = this.ratingFilter();
    const year = this.yearFilter();
    const sort = this.sortBy();

    const list = this.movies().filter(m => {
      if (status === 'watched' && !m.watched) return false;
      if (status === 'unwatched' && m.watched) return false;
      if (source !== 'all' && m.source !== source) return false;
      if (year !== 'all' && m.year !== Number(year)) return false;
      if (rating === 'unrated' && m.rating !== null) return false;
      if (rating !== 'all' && rating !== 'unrated' && (m.rating ?? 0) < Number(rating)) return false;
      return true;
    });

    switch (sort) {
      case 'title':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case 'year':
        return list.sort((a, b) => b.year - a.year);
      case 'imdb':
        return list.sort((a, b) => (b.imdbRating ?? -1) - (a.imdbRating ?? -1));
      case 'mine':
        return list.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
      default:
        return list.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    }
  });

  hasFilters = computed(
    () =>
      this.statusFilter() !== 'all' ||
      this.sourceFilter() !== 'all' ||
      this.ratingFilter() !== 'all' ||
      this.yearFilter() !== 'all',
  );

  // Selected movies that are currently on screen
  selectedVisibleIds = computed(() => {
    const visible = new Set(this.visibleMovies().map(m => m.id));
    return this.selectedIds().filter(id => visible.has(id));
  });

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

  clearFilters() {
    this.statusFilter.set('all');
    this.sourceFilter.set('all');
    this.ratingFilter.set('all');
    this.yearFilter.set('all');
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
        width: '400px',
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

  isSelected(id: number | string | undefined) {
    return id !== undefined && this.selectedIds().includes(id);
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
    const ids = this.selectedVisibleIds();

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
          this.selectedIds.update(list => list.filter(id => !ids.includes(id)));
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