import { Component, OnInit, Input, OnChanges, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'kt-select-with-search',
  templateUrl: './select-with-search.component.html',
  styleUrls: ['./select-with-search.component.scss']
})
export class SelectWithSearchComponent implements OnInit,OnChanges {

  @Input() labelKey = 'label';
  @Input() idKey = 'id';
  @Input() options = [];
  @Input() model;
  @Output() selectChange = new EventEmitter();
  originalOptions:any;
  searchControl = new FormControl()
  destroy$ = new Subject() 
  constructor() { }

  ngOnChanges(){
    console.log(this.options)
    this.originalOptions = [...this.options];
    if (this.model !== undefined) {
      this.model = this.options.find(
        currentOption => currentOption[this.idKey] === this.model
      );
    }
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(term => this.search(term));
  }
  ngOnInit() {
 
  }

  search(value: string) {
    this.options = this.originalOptions.filter(
      option => option[this.labelKey].includes(value)
    );
  }
  get label() {
    return this.model ? this.model[this.labelKey] : 'Select...';
  }
  select(option) {
    this.model = option;
    this.selectChange.emit(option[this.idKey]);
  }
  isActive(option) {
    if (!this.model) {
      return false;
    }

    return option[this.idKey] === this.model[this.idKey];
  }
}
