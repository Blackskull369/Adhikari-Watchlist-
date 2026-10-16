import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Movie } from '../models/movie.model';

@Injectable({ providedIn: 'root' })
export class MovieStoreService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/watchlist`;

  getAll(): Observable<Movie[]> {
    return this.http.get<Movie[]>(this.url);
  }

  getById(id: number | string): Observable<Movie> {
    return this.http.get<Movie>(`${this.url}/${id}`);
  }

  add(movie: Movie): Observable<Movie> {
    return this.http.post<Movie>(this.url, movie);
  }

  update(id: number | string, changes: Partial<Movie>): Observable<Movie> {
    return this.http.patch<Movie>(`${this.url}/${id}`, changes);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}