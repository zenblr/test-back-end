import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[ktDecimalOnly]'
})
export class DecimalOnlyDirective {

  constructor(private _el: ElementRef) { }

    @HostListener('input', ['$event']) onInputChange(event) {
        const initalValue = this._el.nativeElement.value;
        this._el.nativeElement.value = initalValue.replace(/^\d+\.\d{0,2}$/g, '');
        if (initalValue !== this._el.nativeElement.value) {
            event.stopPropagation();
        }
    }

}
