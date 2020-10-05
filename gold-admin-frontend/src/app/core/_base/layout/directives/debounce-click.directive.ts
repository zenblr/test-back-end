import { Directive, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, throttleTime } from 'rxjs/operators';

@Directive({
  selector: '[ktDebounceClick]'
})
export class DebounceClickDirective {

  @Input() debounceTime = 500;
  @Output() debounceClick = new EventEmitter();
  private clicks = new Subject();
  private subscription: Subscription;

  constructor() { }

  ngOnInit() {
    this.subscription = this.clicks
      .pipe(throttleTime(this.debounceTime))
      .subscribe(e => this.debounceClick.emit(e));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  @HostListener('click', ['$event'])
  clickEvent(event) {
    event.preventDefault();
    event.stopPropagation();
    this.clicks.next(event);
  }

}
