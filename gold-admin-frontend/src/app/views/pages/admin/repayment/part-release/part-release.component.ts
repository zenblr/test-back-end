import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'kt-part-release',
  templateUrl: './part-release.component.html',
  styleUrls: ['./part-release.component.scss']
})
export class PartReleaseComponent implements OnInit {

  showReleaseSummary: boolean;
  showPaymentConfirmation: boolean;
  url: string;
  fullReleaseScreen = false;

  constructor(private router: Router) { }

  ngOnInit() {
    console.log(this.router.url)
    this.url = this.router.url
    if (this.url.includes('full-release')) {
      this.fullReleaseScreen = true
      this.showReleaseSummary = true
    } else {
      this.fullReleaseScreen = false
      this.showReleaseSummary = false

    }
  }

  fullRelease() {
    this.router.navigate(['/admin/repayment/full-release'])
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
