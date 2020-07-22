import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { JewelleryReleaseService } from '../../../../../core/repayment/jewellery-release/services/jewellery-release.service';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { ImagePreviewDialogComponent } from '../../../../partials/components/image-preview-dialog/image-preview-dialog.component';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';

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
  selectedOrnaments: any = [];
  images = [];
  totalSelectedOrnamentDetails: any;
  paymentValue: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private jewelleryReleaseService: JewelleryReleaseService,
    private dialog: MatDialog,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    console.log(this.router.url)
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
    // Array.prototype.push.apply(this.selectedOrnaments, this.loanDetails.customerLoan.loanOrnamentsDetail)
    // this.ornamentSummary()
  }

  selectOrnament(event, index, item) {
    // console.log(event, index, item)
    if (event) {
      this.selectedOrnaments.push(item)
    } else {
      const i = this.selectedOrnaments.findIndex(e => e.id === item.id)
      this.selectedOrnaments.splice(i, 1)
      if (this.selectedOrnaments.length === 0) this.showReleaseSummary = false
    }
  }

  release() {
    this.showReleaseSummary = true;
    if (this.areAllOrnamnentsSelected()) {
      this.fullRelease()
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
      console.log(this.loanDetails)
      this.selectedOrnaments = this.loanDetails.customerLoan.loanOrnamentsDetail
    }
    let ornamentIdArr = this.selectedOrnaments.map(e => e.id)
    const params = {
      masterLoanId: this.loanDetails.customerLoan.loanOrnamentsDetail[0].masterLoanId,
      ornamentId: ornamentIdArr,
    }
    this.jewelleryReleaseService.partReleaseOrnaments(params).pipe(map(res => {
      console.log(res);
      if (res) {
        this.totalSelectedOrnamentDetails = res
      }
    })).subscribe()

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

    if (typeof value == 'object') {
      value = value[0]
    }
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
      width: '500px'
    })

    dialogRef.afterClosed().subscribe(res => {
      console.log(res)
      this.paymentValue = res
      this.ref.detectChanges()
    })
  }
}
