import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[ktAlphabets]'
})
export class AlphabetsDirective {

  key;

  constructor(public el: ElementRef) { }

  // @HostListener('input', ['$event']) onInputChange(event) {
  //   const initalValue = this._el.nativeElement.value;
  //   this._el.nativeElement.value = initalValue.replace(/[^A-Za-z]*/g, '');
  //   if (initalValue !== this._el.nativeElement.value) {
  //     event.stopPropagation();
  //   }
  // }

  @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent) {
    this.key = event.keyCode;
    // console.log(this.key);
    if ((this.key >= 15 && this.key <= 64) || (this.key >= 123) || (this.key >= 96 && this.key <= 105)) {
      event.preventDefault();
    }
  }

}
