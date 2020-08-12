import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { CustomerManagementService } from '../../../../core/customer-management';
import { ScrapCustomerManagementService } from '../../../../core/scrap-management';
import { tap } from 'rxjs/operators';
import { ImagePreviewDialogComponent } from '../image-preview-dialog/image-preview-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'kt-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.scss']
})
export class CustomerDetailsComponent implements OnInit {
  images: any[] = []
  customerId: number;
  cutomerDetails: any
  url: any;

  constructor(
    private customerService: CustomerManagementService,
    private scrapCustomerManagementService: ScrapCustomerManagementService,
    private route: ActivatedRoute,
    private router: Router,
    private dilaog: MatDialog
  ) {
    this.url = (this.router.url.split('/')[2]);
  }

  ngOnInit() {
    this.customerId = this.route.snapshot.params.id;
    if (this.url == 'scrap-management') {
      this.getScrapCustomerById();
    } else {
      this.getCustomerById();
    }
  }

  getCustomerById() {
    this.customerService.getCustomerById(this.customerId).pipe(
      tap(res => {
        this.cutomerDetails = res.data;
        this.prepareImages();
      })).subscribe();
  }

  getScrapCustomerById() {
    this.scrapCustomerManagementService.getScrapCustomerById(this.customerId).pipe(
      tap(res => {
        this.cutomerDetails = res.data;
        this.prepareImages();
      })).subscribe();
  }

  viewLoan(loanId, masterLoanId) {
    this.router.navigate([`/admin/customer-management/loan-details/${loanId}/${masterLoanId}`])
  }

  viewScrap(scrap) {
    this.router.navigate(['/admin/scrap-management/scrap-details/' + scrap.id]);
  }

  prepareImages() {
    Array.prototype.push.apply(this.images, this.cutomerDetails.customerKycAddress[0].addressProofImage)
    Array.prototype.push.apply(this.images, this.cutomerDetails.customerKycAddress[1].addressProofImage)
    // Array.prototype.push.apply(this.images,this.cutomerDetails.customerKycBank[0].passbookProof)
    Array.prototype.push.apply(this.images, this.cutomerDetails.customerKycPersonal.identityProofImage)
    // console.log(this.images)
  }

  preview(value) {
    let index = this.images.indexOf(value)
    this.dilaog.open(ImagePreviewDialogComponent, {
      data: {
        images: this.images,
        index: index
      },
      width: 'auto'
    })
  }

}
