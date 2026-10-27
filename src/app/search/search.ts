import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl, FormControl, ReactiveFormsModule, ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError, debounceTime, distinctUntilChanged, EMPTY, map, Observable, switchMap, tap,
} from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { MovieApiService } from '../services/movie-api.service';
import { MovieStoreService } from '../services/movie-store.service';
import { NotificationService } from '../services/notification.service';
import { SearchResult } from '../models/movie.model';
import { MovieCard } from '../movie-card/movie-card';
import { Autofocus } from '../directives/autofocus';


function minSearchLength(control: AbstractControl): ValidationErrors | null {
  const text = (control.value ?? '').trim();
  return text.length > 0 && text.length < 2 ? { minChars: true } : null;
}

@Component({
  selector: 'app-search',
  imports: [
    ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressBarModule, MovieCard, Autofocus,
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search implements OnInit {
  private api = inject(MovieApiService);
  private store = inject(MovieStoreService);
  private notify = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  searchControl = new FormControl('', {
    nonNullable: true,
    validators: [minSearchLength],
  });

  results = signal<SearchResult[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  searched = signal(false);
  lastQuery = signal('');

  savedIds = signal<string[]>([]);
  addingIds = signal<string[]>([]);

  ngOnInit() {
    this.loadSavedIds();

    
    this.searchControl.valueChanges
      .pipe(
        map(text => text.trim()),
        debounceTime(300),
        distinctUntilChanged(),
        tap(text => this.updateUrl(text)),
        switchMap(text => this.runSearch(text)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    
    const q = this.route.snapshot.queryParamMap.get('q');
    if (q) {
      this.searchControl.setValue(q);
    }
  }

  private runSearch(text: string): Observable<SearchResult[]> {
    if (text.length < 2) {
      this.results.set([]);
      this.error.set(null);
      this.loading.set(false);
      this.searched.set(false);
      return EMPTY;
    }

    this.lastQuery.set(text);
    this.loading.set(true);
    this.error.set(null);

    return this.api.search(text).pipe(
      tap(list => {
        this.results.set(list);
        this.searched.set(true);
        this.loading.set(false);
      }),
     
      catchError(err => {
        this.results.set([]);
        this.error.set(this.friendlyError(err));
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  private updateUrl(text: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: text.length >= 2 ? text : null },
      replaceUrl: true,
    });
  }

  private friendlyError(err: unknown): string {
    let detail = '';

    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        return 'Network problem. Check your internet connection and try again.';
      }
      detail = err.error?.Error ?? '';
      if (!detail && err.status === 401) {
        detail = 'Invalid API key!';
      }
    } else if (err instanceof Error) {
      detail = err.message;
    }

    if (detail.toLowerCase().includes('limit')) {
      return 'The daily search limit was reached. Please try again tomorrow.';
    }
    if (detail.toLowerCase().includes('api key')) {
      return 'The movie API key is missing or not activated. Check environment.ts and your activation email.';
    }
    return 'Something went wrong while searching. Please try again.';
  }

  retry() {
    this.runSearch(this.searchControl.value.trim()).subscribe();
  }

  clear() {
    this.searchControl.setValue('');
  }
  openDetail(result: SearchResult) {
  this.router.navigate(['/search', result.imdbId]);
}

  
  private loadSavedIds() {
    this.store.getAll().subscribe({
      next: movies => {
        this.savedIds.set(movies.map(m => m.imdbId).filter((id): id is string => !!id));
      },
      error: () => this.notify.error('Could not load your watchlist'),
    });
  }

  isSaved(imdbId: string) {
    return this.savedIds().includes(imdbId);
  }

  isAdding(imdbId: string) {
    return this.addingIds().includes(imdbId);
  }

  
  addToWatchlist(result: SearchResult) {
    if (this.isSaved(result.imdbId) || this.isAdding(result.imdbId)) {
      return;
    }

    this.addingIds.update(list => [...list, result.imdbId]);

    this.api
      .getDetails(result.imdbId)
      .pipe(switchMap(movie => this.store.add(movie)))
      .subscribe({
        next: () => {
          this.savedIds.update(list => [...list, result.imdbId]);
          this.addingIds.update(list => list.filter(id => id !== result.imdbId));
          this.notify.success(`"${result.title}" added to your watchlist`);
        },
        error: () => {
          this.addingIds.update(list => list.filter(id => id !== result.imdbId));
          this.notify.error('Could not add the movie. Please try again.');
        },
      });
  }
}