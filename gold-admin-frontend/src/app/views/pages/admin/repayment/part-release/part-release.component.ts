import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { JewelleryReleaseService } from '../../../../../core/repayment/jewellery-release/services/jewellery-release.service';
import { map } from 'rxjs/operators';

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
  id: any;
  loanDetails: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private jewelleryReleaseService: JewelleryReleaseService
  ) { }

  ngOnInit() {
    console.log(this.router.url)
    this.id = this.route.snapshot.params.id
    this.url = this.router.url
    if (this.url.includes('full-release')) {
      this.fullReleaseScreen = true
      this.showReleaseSummary = true
      this.patchValuePartRelease()
    } else {
      this.fullReleaseScreen = false
      this.showReleaseSummary = false
      this.patchValueFullRelease()
    }
  }

  patchValuePartRelease() {
    this.jewelleryReleaseService.getPartReleaseInfo(this.id).pipe(map(res => {
      this.loanDetails = res;
    }))
  }

  patchValueFullRelease() {
    this.jewelleryReleaseService.getFullReleaseInfo(this.id).pipe(map(res => {
      this.loanDetails = res;
    }))
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
