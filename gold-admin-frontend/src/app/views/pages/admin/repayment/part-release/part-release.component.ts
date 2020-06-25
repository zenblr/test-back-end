import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'kt-part-release',
  templateUrl: './part-release.component.html',
  styleUrls: ['./part-release.component.scss']
})
export class PartReleaseComponent implements OnInit {

  showReleaseSummary: boolean;
  showPaymentConfirmation: boolean;
  constructor() { }

  ngOnInit() {
  }

  selectOrnament(event) {
    console.log(event)
  }

  release() {
    this.showReleaseSummary = true;
  }

  proceed() {
    this.showPaymentConfirmation = true
  }

  cancelRelease() {
    this.showReleaseSummary = false
    this.showPaymentConfirmation = false
  }

  pay() { }

  cancelPayment() {
    this.showPaymentConfirmation = false
  }
}
