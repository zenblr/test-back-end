import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[ktAlphabets]'
})
export class AlphabetsDirective {

  constructor(public _el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event) {
    const initalValue = this._el.nativeElement.value;
    this._el.nativeElement.value = initalValue.replace(/[^A-Za-z]*/g, '');
    if (initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }

}
