import {
  Component, DestroyRef, ElementRef, OnInit, computed, effect, inject, signal, viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { MovieStoreService } from '../services/movie-store.service';
import { Movie } from '../models/movie.model';

Chart.register(...registerables);

const PALETTE = [
  '#3f51b5', '#7e57c2', '#26a69a', '#ef6c00', '#ec407a',
  '#42a5f5', '#9ccc65', '#8d6e63', '#78909c',
];

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink, MatCardModule, MatButtonModule, MatButtonToggleModule,
    MatIconModule, MatListModule, MatProgressBarModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private store = inject(MovieStoreService);
  private destroyRef = inject(DestroyRef);

  movies = signal<Movie[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  chartMode = signal<'genre' | 'status'>('genre');

  // The <canvas> in the HTML (it only exists once data is loaded)
  canvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private chart: { destroy(): void } | null = null;

  stats = computed(() => {
    const list = this.movies();
    const watched = list.filter(m => m.watched).length;
    const rated = list.filter(m => m.rating !== null);
    const average = rated.length
      ? (rated.reduce((sum, m) => sum + (m.rating ?? 0), 0) / rated.length).toFixed(1)
      : 'N/A';

    return [
      { label: 'Total Movies', value: list.length, icon: 'movie', color: '#3f51b5' },
      { label: 'Watched', value: watched, icon: 'check_circle', color: '#2e7d32' },
      { label: 'Unwatched', value: list.length - watched, icon: 'schedule', color: '#ef6c00' },
      { label: 'Average Rating', value: average, icon: 'star', color: '#f9a825' },
      { label: 'From API', value: list.filter(m => m.source === 'api').length, icon: 'cloud', color: '#0277bd' },
      { label: 'Manual', value: list.filter(m => m.source === 'manual').length, icon: 'edit', color: '#6a1b9a' },
    ];
  });

  byGenre = computed(() => {
    const counts = new Map<string, number>();
    for (const m of this.movies()) {
      counts.set(m.genre, (counts.get(m.genre) ?? 0) + 1);
    }
    const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return { labels: entries.map(e => e[0]), values: entries.map(e => e[1]) };
  });

  byStatus = computed(() => {
    const watched = this.movies().filter(m => m.watched).length;
    return { labels: ['Watched', 'Unwatched'], values: [watched, this.movies().length - watched] };
  });

  recent = computed(() =>
    [...this.movies()].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, 5),
  );

  constructor() {
    
    effect(() => {
      const el = this.canvas();
      const mode = this.chartMode();
      const genre = this.byGenre();
      const status = this.byStatus();

      this.chart?.destroy();
      this.chart = null;

      if (!el) {
        return;
      }

      if (mode === 'genre') {
        this.chart = new Chart(el.nativeElement, {
          type: 'bar',
          data: {
            labels: genre.labels,
            datasets: [{
              label: 'Movies',
              data: genre.values,
              backgroundColor: genre.labels.map((_, i) => PALETTE[i % PALETTE.length]),
              borderRadius: 6,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
          },
        });
      } else {
        this.chart = new Chart(el.nativeElement, {
          type: 'doughnut',
          data: {
            labels: status.labels,
            datasets: [{
              data: status.values,
              backgroundColor: ['#2e7d32', '#ef6c00'],
              borderWidth: 0,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
          },
        });
      }
    });

    this.destroyRef.onDestroy(() => this.chart?.destroy());
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);

    this.store.getAll().subscribe({
      next: data => {
        this.movies.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load your dashboard. Is the API running?');
        this.loading.set(false);
      },
    });
  }
}