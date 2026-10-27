
import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

import { AuthService } from '../services/auth.service';
import { MovieStoreService } from '../services/movie-store.service';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink, RouterLinkActive, MatToolbarModule,
    MatButtonModule, MatIconModule, MatBadgeModule,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private store = inject(MovieStoreService);

  
  count = toSignal(this.store.count$, { initialValue: 0 });

  ngOnInit() {
    this.store.refreshCount();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}