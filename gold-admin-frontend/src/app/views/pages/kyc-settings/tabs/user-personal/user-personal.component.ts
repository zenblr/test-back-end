import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'kt-user-personal',
  templateUrl: './user-personal.component.html',
  styleUrls: ['./user-personal.component.scss']
})
export class UserPersonalComponent implements OnInit {

  @Output() next: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  submit() {
    this.next.emit(true);
  }

}
