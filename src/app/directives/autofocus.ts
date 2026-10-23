import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
})
export class Autofocus implements AfterViewInit {
  private el = inject<ElementRef<HTMLElement>>(ElementRef);

  ngAfterViewInit() {
    this.el.nativeElement.focus();
  }
}