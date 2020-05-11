import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgbNavChangeEvent, NgbNav } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'kt-merchant',
  templateUrl: './merchant.component.html',
  styleUrls: ['./merchant.component.scss']
})
export class MerchantComponent implements OnInit {

  active = 1;
  disabled: boolean[] = [false, false, false];
  @ViewChild('NgbNav', { static: true }) nav: NgbNav;

  constructor(private ref: ChangeDetectorRef) { }

  ngOnInit() {
  }

  onNavChange(changeEvent: NgbNavChangeEvent) {
    if (changeEvent.nextId === 3) {
      changeEvent.preventDefault();
    }
  }

  next(event) {
    if (this.active < this.disabled.length) {
      for (let i = 0; i < this.disabled.length; i++) {
        this.disabled[i] = true;
        if (i <= this.active) {
          this.disabled[i] = !this.disabled[i];
        }
      }
      this.active++;
    } else {
      this.active = 1;
      this.disabled[4] = true;
      this.disabled[0] = false;
    }

    this.ref.detectChanges();

  }

}
