import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Movie, SearchResult } from '../models/movie.model';

interface OmdbSearchItem {
  Title: string;
  Year: string;
  imdbID: string;
  Poster: string;
}

interface OmdbSearchResponse {
  Response: 'True' | 'False';
  Search?: OmdbSearchItem[];
  Error?: string;
}

interface OmdbDetails {
  Response: 'True' | 'False';
  Error?: string;
  Title: string;
  Year: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Plot: string;
  Poster: string;
  imdbRating: string;
  imdbID: string;
}

function clean(value: string | undefined): string | null {
  return !value || value === 'N/A' ? null : value;
}

function toNumber(value: string | undefined): number {
  const n = parseInt(value ?? '', 10);
  return isNaN(n) ? 0 : n;
}

@Injectable({ providedIn: 'root' })
export class MovieApiService {
  private http = inject(HttpClient);
  private url = environment.movieApiUrl;
  private key = environment.movieApiKey;

  search(text: string): Observable<SearchResult[]> {
    return this.http
      .get<OmdbSearchResponse>(this.url, {
        params: { apikey: this.key, s: text, type: 'movie' },
      })
      .pipe(
        map(res => {
          if (res.Response === 'False') {
            if (res.Error === 'Movie not found!' || res.Error === 'Too many results.') {
              return [];
            }
            throw new Error(res.Error ?? 'Search failed');
          }

          return (res.Search ?? []).map(item => ({
            imdbId: item.imdbID,
            title: item.Title,
            year: item.Year,
            posterUrl: clean(item.Poster),
          }));
        }),
      );
  }

  getDetails(imdbId: string): Observable<Movie> {
    return this.http
      .get<OmdbDetails>(this.url, {
        params: { apikey: this.key, i: imdbId, plot: 'full' },
      })
      .pipe(
        map(res => {
          if (res.Response === 'False') {
            throw new Error(res.Error ?? 'Could not load the movie');
          }

          const movie: Movie = {
            source: 'api',
            title: res.Title,
            year: toNumber(res.Year),
            director: clean(res.Director) ?? 'Unknown',
            genre: clean(res.Genre)?.split(',')[0].trim() ?? 'Other',
            runtime: toNumber(res.Runtime),
            posterUrl: clean(res.Poster),
            plot: clean(res.Plot),
            watched: false,
            rating: null,
            imdbRating: clean(res.imdbRating) ? parseFloat(res.imdbRating) : null,
            imdbId: res.imdbID,
            addedAt: new Date().toISOString(),
          };

          return movie;
        }),
      );
  }
}