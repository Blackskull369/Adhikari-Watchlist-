import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-watchlist',
  imports: [
    MatCardModule, MatButtonModule, MatButtonToggleModule, MatCheckboxModule,
    MatChipsModule, MatFormFieldModule, MatIconModule, MatSelectModule,
    MatSlideToggleModule, MatTooltipModule,
  ],
  templateUrl: './watchlist.html',
  styleUrl: './watchlist.scss',
})
export class Watchlist {
  stars = [1, 2, 3, 4, 5];

  movies = [
    { title: 'Inception', year: 2010, genre: 'Sci-Fi', source: 'api', watched: true, imdb: 8.8, userRating: 5 },
    { title: 'Pawo', year: 2016, genre: 'Drama', source: 'manual', watched: false, imdb: null, userRating: 0 },
    { title: 'Interstellar', year: 2014, genre: 'Sci-Fi', source: 'api', watched: false, imdb: 8.7, userRating: 0 },
    { title: 'Travellers and Magicians', year: 2003, genre: 'Drama', source: 'manual', watched: true, imdb: null, userRating: 4 },
    { title: 'The Matrix', year: 1999, genre: 'Action', source: 'api', watched: true, imdb: 8.7, userRating: 4 },
  ];
}