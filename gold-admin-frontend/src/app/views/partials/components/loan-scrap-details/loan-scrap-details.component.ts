import { Component, OnInit } from '@angular/core';
import { LoanApplicationFormService } from '../../../../core/loan-management';
import { ScrapCustomerManagementService } from '../../../../core/scrap-management';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { ImagePreviewDialogComponent } from '../image-preview-dialog/image-preview-dialog.component';
import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component';

@Component({
  selector: 'kt-loan-scrap-details',
  templateUrl: './loan-scrap-details.component.html',
  styleUrls: ['./loan-scrap-details.component.scss']
})
export class LoanScrapDetailsComponent implements OnInit {
  images: any = []
  loanId;
  scrapId;
  details: any
  pdf = {
    loanAgreementCopyImage: false, pawnCopyImage: false, schemeConfirmationCopyImage: false,
    purchaseVoucherImage: false, purchaseInvoiceImage: false, saleInvoiceImage: false
  }
  masterLoanId: any;
  masterAndLoanIds: { loanId: any; masterLoanId: any; };

  constructor(
    private loanservice: LoanApplicationFormService,
    private scrapCustomerManagementService: ScrapCustomerManagementService,
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    if (this.route.snapshot.params.scrapId) {
      this.getScrapDetails();
    } else {
      this.getLoanDetails();
    }
  }

  getLoanDetails() {
    this.loanId = this.route.snapshot.params.loanId
    let masterLoanId = this.route.snapshot.params.masterLoanId
    this.loanservice.getLoanDetails( masterLoanId).subscribe(res => {
      this.details = res.data;
      this.masterAndLoanIds = { loanId: res.data.customerLoanDisbursement[0].loanId, masterLoanId: res.data.customerLoanDisbursement[0].masterLoanId }
      this.createOrnamentsImage()
      this.pdfCheck()
      console.log(this.images)
    });
  }

  getScrapDetails() {
    this.scrapId = this.route.snapshot.params.scrapId;
    this.scrapCustomerManagementService.getScrapDetails(this.scrapId).subscribe(res => {
      this.details = res.data
      this.createOrnamentsImage()
      this.pdfCheck()
      console.log(this.images)
    });
  }

  pdfCheck() {
    let laonAgree, pawn, scheme, voucher, invoice, sale;
    if (this.details.customerLoanDocument) {
      if (this.details.customerLoanDocument.loanAgreementCopy) {
        laonAgree = this.details.customerLoanDocument.loanAgreementCopyImage[0].split('.')
      }
      if (this.details.customerLoanDocument.pawnCopy) {
        pawn = this.details.customerLoanDocument.pawnCopyImage[0].split('.')
      }
      if (this.details.customerLoanDocument.schemeConfirmationCopy) {
        scheme = this.details.customerLoanDocument.schemeConfirmationCopyImage[0].split('.')
      }
    }
    if (this.details.scrapDocument) {
      if (this.details.scrapDocument.purchaseVoucher) {
        voucher = this.details.scrapDocument.purchaseVoucherImage[0].split('.')
      }
      if (this.details.scrapDocument.purchaseInvoice) {
        invoice = this.details.scrapDocument.purchaseInvoiceImage[0].split('.')
      }
      if (this.details.scrapDocument.saleInvoice) {
        sale = this.details.scrapDocument.saleInvoiceImage[0].split('.')
      }
    }
    if (laonAgree && laonAgree[laonAgree.length - 1] == 'pdf') {
      this.pdf.loanAgreementCopyImage = true
    } else {
      this.pdf.loanAgreementCopyImage = false
    }
    if (pawn && pawn[pawn.length - 1] == 'pdf') {
      this.pdf.pawnCopyImage = true
    } else {
      this.pdf.pawnCopyImage = false
    }
    if (scheme && scheme[scheme.length - 1] == 'pdf') {
      this.pdf.schemeConfirmationCopyImage = true
    } else {
      this.pdf.schemeConfirmationCopyImage = false
    }
    if (voucher && voucher[voucher.length - 1] == 'pdf') {
      this.pdf.purchaseVoucherImage = true
    } else {
      this.pdf.purchaseVoucherImage = false
    }
    if (invoice && invoice[invoice.length - 1] == 'pdf') {
      this.pdf.purchaseInvoiceImage = true
    } else {
      this.pdf.purchaseInvoiceImage = false
    }
    if (sale && sale[sale.length - 1] == 'pdf') {
      this.pdf.saleInvoiceImage = true
    } else {
      this.pdf.saleInvoiceImage = false
    }
  }

  createOrnamentsImage() {
    if (this.scrapId) {
      for (let ornametsIndex = 0; ornametsIndex < this.details.scrapOrnamentsDetail.length; ornametsIndex++) {
        let ornamets = this.details.scrapOrnamentsDetail[ornametsIndex]
        this.createImageArray()
        let keys = Object.keys(ornamets)
        for (let index = 0; index < keys.length; index++) {
          let url = ornamets[keys[index]]
          this.patchUrlIntoForm(keys[index], url, ornametsIndex)
        }
      }
    } else {
      for (let ornametsIndex = 0; ornametsIndex < this.details.loanOrnamentsDetail.length; ornametsIndex++) {
        let ornamets = this.details.loanOrnamentsDetail[ornametsIndex]
        this.createImageArray()
        let keys = Object.keys(ornamets)
        for (let index = 0; index < keys.length; index++) {
          let url = ornamets[keys[index]]
          this.patchUrlIntoForm(keys[index], url, ornametsIndex)
        }
      }
    }
  }

  createImageArray() {
    let data = {
      withOrnamentWeight: '',
      acidTest: '',
      weightMachineZeroWeight: '',
      stoneTouch: '',
      purity: '',
      ornamentImage: '',
      ornamentImageWithWeight: '',
      ornamentImageWithXrfMachineReading: ''
    }
    this.images.push(data)
  }

  patchUrlIntoForm(key, url, index) {
    switch (key) {
      case 'withOrnamentWeightData':
        this.images[index].withOrnamentWeight = url.URL
        break;
      case 'acidTestData':
        this.images[index].acidTest = url.URL
        break;
      case 'weightMachineZeroWeightData':
        this.images[index].weightMachineZeroWeight = url.URL
        break;
      case 'stoneTouchData':
        this.images[index].stoneTouch = url.URL
        break;
      case 'purityTestImage':
        this.images[index].purity = url.URL
        break;
      case 'ornamentImageData':
        this.images[index].ornamentImage = url.URL
        break;
      case 'ornamentImageWithWeightData':
        this.images[index].ornamentImageWithWeight = url.URL
        break;
      case 'ornamentImageWithXrfMachineReadingData':
        this.images[index].ornamentImageWithXrfMachineReading = url.URL
        break;
    }
  }

  preview(value, formIndex) {
    var ext = value.split('.')
    if (ext[ext.length - 1] == 'pdf') {
      this.dialog.open(PdfViewerComponent, {
        data: {
          pdfSrc: value,
          page: 1,
          showAll: true
        },
        width: "80%"
      })
    } else {
      let filterImage = []
      filterImage = Object.values(this.images[formIndex])
      var temp = []
      temp = filterImage.filter(el => {
        return el != ''
      })
      let array = []
      for (let index = 0; index < temp.length; index++) {
        if (typeof temp[index] == "object") {
          array = temp[index]
          temp.splice(index, 1)
        }
      }
      console.log(temp)
      let finalArray = [...array, ...temp]
      console.log(finalArray)
      let index = finalArray.indexOf(value)
      this.dialog.open(ImagePreviewDialogComponent, {
        data: {
          images: finalArray,
          index: index
        },
        width: "auto"
      })
    }
  }

}
