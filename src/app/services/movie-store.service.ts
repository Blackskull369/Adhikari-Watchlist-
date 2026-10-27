import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { Movie } from '../models/movie.model';

@Injectable({ providedIn: 'root' })
export class MovieStoreService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/watchlist`;

  
  private countSubject = new BehaviorSubject<number>(0);
  readonly count$ = this.countSubject.asObservable();

  getAll(): Observable<Movie[]> {
    return this.http.get<Movie[]>(this.url).pipe(
      tap(list => this.countSubject.next(list.length)),
    );
  }

  getById(id: number | string): Observable<Movie> {
    return this.http.get<Movie>(`${this.url}/${id}`);
  }

  add(movie: Movie): Observable<Movie> {
    return this.http.post<Movie>(this.url, movie).pipe(
      tap(() => this.countSubject.next(this.countSubject.value + 1)),
    );
  }

  update(id: number | string, changes: Partial<Movie>): Observable<Movie> {
    return this.http.patch<Movie>(`${this.url}/${id}`, changes);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      tap(() => this.countSubject.next(Math.max(0, this.countSubject.value - 1))),
    );
  }

  refreshCount() {
    this.getAll().subscribe({ error: () => {} });
  }
}