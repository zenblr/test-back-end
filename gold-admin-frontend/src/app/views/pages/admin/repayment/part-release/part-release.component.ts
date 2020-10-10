import { Component, OnInit, ChangeDetectorRef, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { JewelleryReleaseService } from '../../../../../core/repayment/jewellery-release/services/jewellery-release.service';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { ImagePreviewDialogComponent } from '../../../../partials/components/image-preview-dialog/image-preview-dialog.component';
import { PaymentDialogComponent } from '../../../../partials/components/payment-dialog/payment-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { TitleCasePipe } from '@angular/common';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { RazorpayPaymentService } from '../../../../../core/shared/services/razorpay-payment.service';

@Component({
  selector: 'kt-part-release',
  templateUrl: './part-release.component.html',
  styleUrls: ['./part-release.component.scss'],
  providers: [TitleCasePipe],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class PartReleaseComponent implements OnInit {

  showReleaseSummary: boolean;
  showPaymentConfirmation: boolean;
  url: string;
  fullReleaseScreen = false;
  id: any;
  loanDetails: any;
  selectedOrnaments: any = [];
  images = [];
  totalSelectedOrnamentDetails: any;
  paymentValue: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private jewelleryReleaseService: JewelleryReleaseService,
    private dialog: MatDialog,
    private ref: ChangeDetectorRef,
    private toastr: ToastrService,
    private titleCasePipe: TitleCasePipe,
    private ele: ElementRef,
    private layoutUtilsService: LayoutUtilsService,
    private sharedService: SharedService,
    private razorpayPaymentService: RazorpayPaymentService
  ) { }

  ngOnInit() {
    // console.log(this.router.url)
    this.id = this.route.snapshot.params.id
    this.url = this.router.url
    this.patchValuePartRelease()
    if (this.url.includes('full-release')) {
      this.fullReleaseScreen = true
      this.showReleaseSummary = true
    } else {
      this.fullReleaseScreen = false
      this.showReleaseSummary = false
    }
  }

  patchValuePartRelease() {
    this.jewelleryReleaseService.getPartReleaseInfo(this.id).pipe(map(res => {
      this.loanDetails = res;
      if (this.url.includes('full-release')) {
        this.ornamentSummary()
      } else {
        this.createImagesArray()
      }
    })).subscribe()
  }

  fullRelease() {
    this.selectedOrnaments = []
    this.router.navigate([`/admin/repayment/full-release/${this.id}`])
  }

  selectOrnament(event, index, item) {
    if (event) {
      this.selectedOrnaments.push(item)
    } else {
      const i = this.selectedOrnaments.findIndex(e => e.id === item.id)
      this.selectedOrnaments.splice(i, 1)
      if (this.selectedOrnaments.length === 0) this.showReleaseSummary = false
    }
  }

  release() {
    if (this.areAllOrnamnentsSelected()) {
      this.fullRelease()
      this.showReleaseSummary = true;
    } else {
      this.ornamentSummary()
    }
  }

  areAllOrnamnentsSelected() {
    let ornaments = this.loanDetails.customerLoan.loanOrnamentsDetail;
    const flag = ornaments.length === this.selectedOrnaments.length ? true : false
    return flag
  }

  ornamentSummary() {
    let path = this.url.split('/')
    let url = path[path.length - 2]
    if (url === 'full-release') {
      this.selectedOrnaments = this.loanDetails.customerLoan.loanOrnamentsDetail
    }
    let ornamentIdArr = this.selectedOrnaments.map(e => e.id)
    const params = {
      masterLoanId: this.loanDetails.customerLoan.loanOrnamentsDetail[0].masterLoanId,
      ornamentId: ornamentIdArr,
    }
    this.jewelleryReleaseService.partReleaseOrnaments(params).pipe(map(res => {
      if (res) {
        this.showReleaseSummary = true;
        this.totalSelectedOrnamentDetails = res
        this.scrollToBottom()
        this.ref.detectChanges()
      }
    })).subscribe()

  }

  scrollToBottom() {
    setTimeout(() => {
      let view = this.ele.nativeElement.querySelector('#container') as HTMLElement
      view.scrollIntoView({ behavior: "smooth", block: "end" })
    }, 500)
  }


  proceed() {
    this.showPaymentConfirmation = true
    this.scrollToBottom()
  }

  cancelRelease() {
    this.showReleaseSummary = false
    this.showPaymentConfirmation = false
  }

  pay() {



    const ornamnentIds = this.selectedOrnaments.map(e => e.id)
    if (this.paymentValue.paymentType == 'gateway') {
      this.sharedService.paymentGateWayForFullAndPart(Number(this.id), ornamnentIds).subscribe(
        res => {
          this.razorpayPaymentService.razorpayOptions.key = res.razerPayConfig;
          this.razorpayPaymentService.razorpayOptions.amount = res.razorPayOrder.amount;
          this.razorpayPaymentService.razorpayOptions.order_id = res.razorPayOrder.id;
          this.razorpayPaymentService.razorpayOptions.paymentMode = res.paymentMode;
          this.razorpayPaymentService.razorpayOptions.prefill.contact = '000000000';
          this.razorpayPaymentService.razorpayOptions.prefill.email = 'info@augmont.in';
          this.razorpayPaymentService.razorpayOptions.handler = this.razorPayResponsehandler.bind(this);
          this.razorpayPaymentService.initPay(this.razorpayPaymentService.razorpayOptions);
        }
      )

    } else {
      this.apiHit(null)
    }
  }
  razorPayResponsehandler(response) {
    this.apiHit(response)
  }

  apiHit(transactionDetails) {
    const path = this.url.split('/');
    const url = path[path.length - 2];
    const ornamnentIds = this.selectedOrnaments.map(e => e.id)
    let payObject = {
      ornamentId: ornamnentIds,
      masterLoanId: Number(this.id),
      // releaseAmount: this.totalSelectedOrnamentDetails.ornamentWeight.releaseAmount,
      interestAmount: this.totalSelectedOrnamentDetails.loanInfo.interestAmount,
      penalInterest: this.totalSelectedOrnamentDetails.loanInfo.penalInterest,
      payableAmount: this.totalSelectedOrnamentDetails.loanInfo.totalPayableAmount,
      transactionDetails: transactionDetails
    }
    Object.assign(payObject, this.paymentValue, this.totalSelectedOrnamentDetails.ornamentWeight)
    // return
    if (url === 'part-release') {
      this.jewelleryReleaseService.partReleasePayment(payObject).pipe(map(res => {
        if (res) {
          this.toastr.success(this.titleCasePipe.transform(res['message']))
          this.router.navigate(['/admin/loan-management/all-loan'])
        }
      })).subscribe()
    }
    else if (url === 'full-release') {
      this.jewelleryReleaseService.fullReleasePayment(payObject).pipe(map(res => {
        if (res) {
          this.toastr.success(this.titleCasePipe.transform(res['message']))
          this.router.navigate(['/admin/loan-management/all-loan'])
        }
      })).subscribe()
    }
  }


  cancelPayment() {
    this.showPaymentConfirmation = false
  }

  createImagesArray() {
    const ornamentArr = this.loanDetails.customerLoan.loanOrnamentsDetail
    for (let index = 0; index < ornamentArr.length; index++) {
      var data = {
        withOrnamentWeight: '',
        acidTest: '',
        weightMachineZeroWeight: '',
        stoneTouch: '',
        purity: '',
        ornamentImage: ''
      }
      this.images.push(data)
      const element = ornamentArr[index];
      for (const iterator in element) {
        this.patchUrl(iterator, element[iterator], index)
      }
    }
  }

  patchUrl(key, url, index) {
    switch (key) {
      case 'withOrnamentWeightData':
        if (url) this.images[index].withOrnamentWeight = url.URL
        break;
      case 'acidTestData':
        if (url) this.images[index].acidTest = url.URL
        break;
      case 'weightMachineZeroWeightData':
        if (url) this.images[index].weightMachineZeroWeight = url.URL
        break;
      case 'stoneTouchData':
        if (url) this.images[index].stoneTouch = url.URL
        break;
      case 'purityTestImage':
        if (url) this.images[index].purity = url.URL
        break;
      case 'ornamentImageData':
        if (url) this.images[index].ornamentImage = url.URL
        break;
    }

  }

  previewImage(value, ornamnentIndex) {
    let filterImage = []
    filterImage = Object.values(this.images[ornamnentIndex])

    var temp = []
    let indexof = filterImage.findIndex(idx => typeof idx == 'object')

    if (indexof != -1) {
      temp = filterImage[indexof]
      filterImage.splice(indexof, 1)
      Array.prototype.push.apply(filterImage, temp)
    }

    temp = filterImage.filter(el => el != '')
    let index = temp.indexOf(value)
    this.dialog.open(ImagePreviewDialogComponent, {
      data: {
        images: temp,
        index: index
      },
      width: "auto"
    })
  }

  choosePaymentMethod() {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      data: {
        value: this.paymentValue ? this.paymentValue : { paidAmount: this.totalSelectedOrnamentDetails.loanInfo.totalPayableAmount },
        date: this.loanDetails.customerLoan.loanStartDate
      },
      width: '500px'
    })

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.paymentValue = res
        this.ref.detectChanges()
      }
    })
  }

  show() {
    if (new Date() > new Date(this.loanDetails && this.loanDetails.customerLoan.loanEndDate)) {
      return false
    } else {
      return true
    }
  }

  releaseConfirmation() {
    if (!(this.paymentValue && this.paymentValue.paymentType)) {
      return this.toastr.error('Please select a payment method')
    }

    let path = this.url.split('/')
    let url = path[path.length - 2]
    const releaseType = url === 'part-release' ? 'Part Release' : 'Full Release'
    const _title = `Confirm ${releaseType}?`;
    const _description = `Are you sure you want to place a ${releaseType} request?`;
    const _waitDesciption = 'Placing request...';
    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.pay();
      }
    });
  }

}
