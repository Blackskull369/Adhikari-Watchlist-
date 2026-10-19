import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  success(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  error(message: string) {
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }
}