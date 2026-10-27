import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

const TOKEN_KEY = 'watchlist_token';
const USER_KEY = 'watchlist_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/users`;

  login(email: string, password: string): Observable<User> {
    return this.http.get<User[]>(this.url, { params: { email } }).pipe(
      map(users => {
        const user = users.find(u => u.password === password);

        if (!user) {
          throw new Error('Invalid email or password');
        }

        localStorage.setItem(TOKEN_KEY, `fake-jwt-${user.id}-${Date.now()}`);
        localStorage.setItem(
          USER_KEY,
          JSON.stringify({ id: user.id, name: user.name, email: user.email }),
        );
        return user;
      }),
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
}