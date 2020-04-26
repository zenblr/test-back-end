import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'kt-user-banks',
  templateUrl: './user-banks.component.html',
  styleUrls: ['./user-banks.component.scss']
})
export class UserBanksComponent implements OnInit {

  @Output() next: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  submit() {
    this.next.emit(true);
  }

}
