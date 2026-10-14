import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule, MatIconModule, MatListModule, MatChipsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  stats = [
    { label: 'Total Movies', value: 24, icon: 'movie', color: '#3f51b5' },
    { label: 'Watched', value: 15, icon: 'check_circle', color: '#2e7d32' },
    { label: 'Unwatched', value: 9, icon: 'schedule', color: '#ef6c00' },
    { label: 'Average Rating', value: '4.1', icon: 'star', color: '#f9a825' },
    { label: 'From API', value: 18, icon: 'cloud', color: '#0277bd' },
    { label: 'Manual', value: 6, icon: 'edit', color: '#6a1b9a' },
  ];

  chartBars = [
    { label: 'Action', height: 80 },
    { label: 'Drama', height: 60 },
    { label: 'Sci-Fi', height: 95 },
    { label: 'Comedy', height: 40 },
    { label: 'Horror', height: 25 },
  ];

  recent = [
    { title: 'Inception', year: 2010, source: 'API' },
    { title: 'Pawo', year: 2016, source: 'Manual' },
    { title: 'Interstellar', year: 2014, source: 'API' },
    { title: 'Travellers and Magicians', year: 2003, source: 'Manual' },
    { title: 'The Matrix', year: 1999, source: 'API' },
  ];
}