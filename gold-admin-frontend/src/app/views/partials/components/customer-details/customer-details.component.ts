import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { CustomerManagementService } from '../../../../core/customer-management';
import { ScrapCustomerManagementService } from '../../../../core/scrap-management';
import { tap } from 'rxjs/operators';
import { ImagePreviewDialogComponent } from '../image-preview-dialog/image-preview-dialog.component';
import { MatDialog } from '@angular/material';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component';

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
    private dilaog: MatDialog,
    private sharedService: SharedService
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

  viewLoan(masterLoanId) {
    this.router.navigate([`/admin/customer-management/loan-details/${masterLoanId}`])
  }

  viewTransfer(masterLoanId) {
    this.router.navigate([`/admin//loan-management/loan-transfer/${masterLoanId}`], { queryParams: { action: 'view' } })
  }

  viewScrap(scrap) {
    this.router.navigate(['/admin/scrap-management/scrap-details/' + scrap.id]);
  }

  prepareImages() {
    if (this.cutomerDetails.userType == 'Individual') {
      Array.prototype.push.apply(this.images, this.cutomerDetails.customerKycAddress[0].addressProofImage)
    } else {
      Array.prototype.push.apply(this.images, this.cutomerDetails.customerKycAddress[0].addressProofImage)
      Array.prototype.push.apply(this.images, this.cutomerDetails.customerKycAddress[1].addressProofImage)
    }
    // Array.prototype.push.apply(this.images,this.cutomerDetails.customerKycBank[0].passbookProof)
    Array.prototype.push.apply(this.images, this.cutomerDetails.customerKycPersonal.identityProofImage)
    this.images.push(this.cutomerDetails.panImg)
    if (this.cutomerDetails.customerKycPersonal.profileImg) this.images.push(this.cutomerDetails.customerKycPersonal.profileImg)
    // this.images = this.images.filter(e => e)
    console.log(this.images)
  }

  preview(value) {
    if (this.isPdf(value)) return this.viewPdf(value)

    const img = this.images.filter(e => {
      const ext = this.sharedService.getExtension(e)
      return ext !== 'pdf'
    })
    let index = img.indexOf(value)
    this.dilaog.open(ImagePreviewDialogComponent, {
      data: {
        images: img,
        index: index
      },
      width: 'auto'
    })
  }

  viewPdf(value) {
    this.dilaog.open(PdfViewerComponent, {
      data: {
        pdfSrc: value,
        page: 1,
        showAll: true
      },
      width: "80%"
    })
  }

  isPdf(image: string): boolean {
    const ext = this.sharedService.getExtension(image)
    const isPdf = ext == 'pdf' ? true : false
    return isPdf
  }

}
