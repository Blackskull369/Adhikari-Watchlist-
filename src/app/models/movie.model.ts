export type MovieSource = 'api' | 'manual';

export interface Movie {
  id?: number | string;
  source: MovieSource;
  title: string;
  year: number;
  director: string;
  genre: string;
  runtime: number;
  posterUrl: string | null;
  plot: string | null;
  watched: boolean;
  rating: number | null;
  imdbRating: number | null;
  imdbId?: string | null;
  addedAt: string;
}

export interface SearchResult {
  imdbId: string;
  title: string;
  year: string;
  posterUrl: string | null;
}