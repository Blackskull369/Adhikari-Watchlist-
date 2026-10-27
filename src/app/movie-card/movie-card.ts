import { Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { SearchResult } from '../models/movie.model';

@Component({
  selector: 'app-movie-card',
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.scss',
})
export class MovieCard {
  
  movie = input.required<SearchResult>();
  inWatchlist = input(false);
  busy = input(false);

  
  add = output<SearchResult>();
  open = output<SearchResult>();
}
