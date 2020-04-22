import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgbNavChangeEvent, NgbNav } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'kt-kyc-settings',
  templateUrl: './kyc-settings.component.html',
  styleUrls: ['./kyc-settings.component.scss']
})
export class KycSettingsComponent implements OnInit {

  active = 1;
  disabled: boolean[] = [false, true, true, true, true];
  @ViewChild('NgbNav', { static: true }) nav: NgbNav;

  constructor(private ref: ChangeDetectorRef) { }

  ngOnInit() {
    // this.next();
  }

  onNavChange(changeEvent: NgbNavChangeEvent) {
    if (changeEvent.nextId === 3) {
      changeEvent.preventDefault();
    }
  }

  next(event) {
    for (let i = 0; i < this.disabled.length; i++) {
      this.disabled[i] = true;
      if (i == this.active) {
        this.disabled[this.active] = !this.disabled[this.active];
      }
    }
    this.active++;
    this.ref.detectChanges();
  }



}
