import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[ktTrimControl]'
})
export class TrimControlDirective {

  get ctrl() {
    return this.ngControl.control;
  }

  constructor(
    private ngControl: NgControl
  ) { }

  @HostListener("blur")
  onBlur(value) {
    this.ctrl.setValue(this.ctrl.value.trim());
  }

}
