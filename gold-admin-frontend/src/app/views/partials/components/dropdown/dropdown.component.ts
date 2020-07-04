import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'kt-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {
  @Input() dropdownValue;
  @Input() isDisabled: boolean;
  @Input() title: string;
  @Output() dropdownResult = new EventEmitter;
  constructor() { }

  ngOnInit() {
  }

  selectedValue(value) {
    this.dropdownResult.emit(value);
  }

}
