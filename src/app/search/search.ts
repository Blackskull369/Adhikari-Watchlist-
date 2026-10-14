import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-search',
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  results = [
    { title: 'Inception', year: 2010, added: false },
    { title: 'Inception: The Cobol Job', year: 2010, added: true },
    { title: 'Interstellar', year: 2014, added: false },
    { title: 'The Dark Knight', year: 2008, added: false },
    { title: 'Memento', year: 2000, added: true },
    { title: 'Tenet', year: 2020, added: false },
    { title: 'Dunkirk', year: 2017, added: false },
    { title: 'The Prestige', year: 2006, added: false },
  ];
}