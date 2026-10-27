import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'runtimeFormat' })
export class RuntimeFormatPipe implements PipeTransform {
  transform(minutes: number | null | undefined): string {
    if (!minutes || minutes <= 0) {
      return 'N/A';
    }

    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    if (hours === 0) {
      return `${rest}m`;
    }
    if (rest === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${rest}m`;
  }
}