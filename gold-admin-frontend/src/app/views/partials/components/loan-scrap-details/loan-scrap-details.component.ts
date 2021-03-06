import { Component, OnDestroy, OnInit, ViewChildren, QueryList, AfterViewInit, ElementRef } from '@angular/core';
import { LoanApplicationFormService } from '../../../../core/loan-management';
import { ScrapCustomerManagementService } from '../../../../core/scrap-management';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { ImagePreviewDialogComponent } from '../image-preview-dialog/image-preview-dialog.component';
import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { takeUntil, distinctUntilChanged, skip, map, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { EmiLogsDialogComponent } from '../emi-logs-dialog/emi-logs-dialog.component';
import { PartPaymentLogDialogComponent } from '../part-payment-log-dialog/part-payment-log-dialog.component';
import { NgxPermissionsService } from 'ngx-permissions';
@Component({
  selector: 'kt-loan-scrap-details',
  templateUrl: './loan-scrap-details.component.html',
  styleUrls: ['./loan-scrap-details.component.scss']
})
export class LoanScrapDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
  images: any = []
  loanId;
  scrapId;
  details: any
  pdf = {
    loanAgreementCopyImage: false, pawnCopyImage: false, schemeConfirmationCopyImage: false,
    purchaseVoucherImage: false, purchaseInvoiceImage: false, saleInvoiceImage: false, declarationImage: false,
    loanTransferPawnImage: false, signedChequeImage: false
  }
  masterLoanId: any;
  masterAndLoanIds: { loanId: any; masterLoanId: any; };
  scrapIds: { scrapId: any; };
  destroy$ = new Subject();
  packetImages = { loan: { documents: [] , packet: [] , transfer: []  }, scrap: [], transfer: [], termsAndConditions: [] };
  @ViewChildren('termsConditions') termsConditions: QueryList<ElementRef>;
  edit: boolean;
  permission: any;

  constructor(
    private loanservice: LoanApplicationFormService,
    private scrapCustomerManagementService: ScrapCustomerManagementService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private sharedService: SharedService,
    private ngxPermission: NgxPermissionsService,
  ) {
    this.sharedService.exportExcel$
      .pipe(
        skip(1),
        distinctUntilChanged(),
        takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          this.soaDownload();
        }
      });

    this.ngxPermission.permissions$.subscribe(res => {
      this.permission = res
    })
  }

  ngOnInit() {
    if (this.route.snapshot.params.scrapId) {
      this.getScrapDetails();
    } else {
      this.getLoanDetails();
      this.initiateTermsAndConditions()
      this.route.queryParams.subscribe(res => {
        if (res['loan-details']) {
          this.edit = true
          // console.log(this.edit)
        }
      }
      );
    }
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getLoanDetails() {
    this.loanId = this.route.snapshot.params.loanId
    this.masterLoanId = this.route.snapshot.params.masterLoanId
    this.loanservice.getLoanDetails(this.masterLoanId).subscribe(res => {
      this.details = res.data;
      this.masterAndLoanIds = { loanId: res.data.customerLoanDisbursement[0].loanId, masterLoanId: res.data.customerLoanDisbursement[0].masterLoanId }
      this.createOrnamentsImage()
      this.pdfCheck()
      // console.log(this.images)
      this.getTermsConditions()
    });
  }

  getScrapDetails() {
    this.scrapId = this.route.snapshot.params.scrapId;
    this.scrapCustomerManagementService.getScrapDetails(this.scrapId).subscribe(res => {
      this.details = res.data;
      this.scrapIds = { scrapId: res.data.scrapDisbursement.scrapId, }
      this.createOrnamentsImage()
      this.pdfCheck()
      console.log(this.images)
    });
  }

  pdfCheck() {
    let laonAgree, pawn, scheme, voucher, invoice, sale, declaration, loanTransferPawn, signedCheque;
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

    if (this.details.loanTransfer) {
      if (this.details.loanTransfer.declarationImage) {
        declaration = this.details.loanTransfer.declarationImage[0].split('.')
      }
      if (this.details.loanTransfer.pawnTicket) {
        loanTransferPawn = this.details.loanTransfer.pawnTicketImage[0].split('.')
      }
      if (this.details.loanTransfer.signedCheque) {
        signedCheque = this.details.loanTransfer.signedChequeImage[0].split('.')
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
    if (declaration && declaration[declaration.length - 1] == 'pdf') {
      this.pdf.declarationImage = true
    } else {
      this.pdf.declarationImage = false
    }
    if (loanTransferPawn && loanTransferPawn[loanTransferPawn.length - 1] == 'pdf') {
      this.pdf.loanTransferPawnImage = true
    } else {
      this.pdf.loanTransferPawnImage = false
    }
    if (signedCheque && signedCheque[signedCheque.length - 1] == 'pdf') {
      this.pdf.signedChequeImage = true
    } else {
      this.pdf.signedChequeImage = false
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

      let packets = this.details.scrapPacketDetails[0]
      let documents = this.details.scrapDocument
      let temp = [];
      if (documents.purchaseVoucherImage) {
        temp.push(documents.purchaseVoucherImage[0])
      }
      if (documents.purchaseInvoiceImage) {
        temp.push(documents.purchaseInvoiceImage[0])
      }
      if (documents.saleInvoiceImage) {
        temp.push(documents.saleInvoiceImage[0])
      }
      temp.push(packets.emptyPacketWithNoOrnamentImage,
        packets.sealingPacketWithCustomerImage,
        packets.sealingPacketWithWeightImage)
      this.packetImages.scrap = [...temp]
      this.packetImages.scrap = this.packetImages.scrap.filter(e => {
        let ext = this.sharedService.getExtension(e)
        return e && ext != 'pdf'
      })

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

      let packets = this.details.loanPacketDetails[0]
      let documents = this.details.customerLoanDocument
      let temp = [];
      let transfer = []
      temp = [...documents.loanAgreementCopyImage, ...documents.pawnCopyImage, ...documents.schemeConfirmationCopyImage]
      if (this.details.loanTransfer) {
        let loanTransfer = this.details.loanTransfer
        transfer = [...loanTransfer.declarationImage, ...loanTransfer.pawnTicketImage, ...loanTransfer.signedChequeImage]

      }
      let packet = []
      packet.push(packets.emptyPacketWithNoOrnamentImage,
        packets.sealingPacketWithCustomerImage,
        packets.sealingPacketWithWeightImage)
      this.packetImages.loan.documents = [...temp]
      this.packetImages.loan.transfer = [...transfer]
      this.packetImages.loan.packet = [...packet]
      // this.packetImages.loan = 
      Object.keys(this.packetImages.loan).forEach(ele => {
        this.packetImages.loan[ele] = this.packetImages.loan[ele].filter(e => {
          let ext = this.sharedService.getExtension(e)
          return e && ext != 'pdf'
        })
      })
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

  viewPackets(value,loanType?) {
    const type = this.masterLoanId ? 'loan' : 'scrap'
    let images = []
    if(type == 'loan'){
       images = this.packetImages[type][loanType]
    }else{
       images = this.packetImages[type]

    }
    const index = images.indexOf(value)

    this.dialog.open(ImagePreviewDialogComponent, {
      data: {
        images: images,
        index: index
      },
      width: "auto"
    })
  }

  viewPartPaymnetsLogs() {

    const dialogRef = this.dialog.open(PartPaymentLogDialogComponent, {
      data: { id: this.details.id },
      width: 'auto'
    })

  }

  viewEmiLogs() {
    const dialogRef = this.dialog.open(EmiLogsDialogComponent, {
      data: { id: this.details.id },
      width: '850px'
    })
  }

  soaDownload() {
    this.masterLoanId = this.route.snapshot.params.masterLoanId
    this.sharedService.soaDownload(this.masterLoanId).subscribe();
    this.sharedService.exportExcel.next(false);
  }

  isPdf(image: string): boolean {
    const ext = this.sharedService.getExtension(image)
    const isPdf = ext == 'pdf' ? true : false
    return isPdf
  }

  initiateTermsAndConditions() {
    const NUMBER_OF_DOCUMENTS = 5
    let array = Array(NUMBER_OF_DOCUMENTS).fill({ path: null, URL: null, name: null })
    this.packetImages.termsAndConditions = array
  }

  getPathArray(type: string) {
    const pathArray = this.packetImages[type].map(e => e.path)
    return pathArray
  }

  getURLArray(type: string) {
    const urlArray = this.packetImages[type].map(e => e.URL)
    return urlArray
  }

  uploadTnC(event, index) {
    var file = event.target.files[0];

    if (this.sharedService.fileValidator(event, 'pdf')) {
      const params = {
        reason: 'loan',
        masterLoanId: this.masterAndLoanIds.masterLoanId
      }
      this.sharedService.uploadFile(file, params).pipe(
        map(res => {
          this.packetImages.termsAndConditions.splice(index, 1, { path: res.uploadFile.path, URL: res.uploadFile.URL, name: res.uploadFile.originalname })
        }),
        finalize(() => {
          this.termsConditions.forEach(e => {
            if (e && e.nativeElement.value) e.nativeElement.value = ''
          })
          event.target.value = ''
        })
      ).subscribe()
    } else {
      event.target.value = ''
    }

  }

  removeTnC(index) {
    this.packetImages.termsAndConditions.splice(index, 1, { path: null, URL: null, name: null })
  }

  SaveTnC() {
    const termsConditions = this.getPathArray('termsAndConditions')
    const masterLoanId = this.masterAndLoanIds.masterLoanId

    this.loanservice.uploadTermsAndConditions({ termsConditions, masterLoanId }).pipe().subscribe()
  }

  getTermsConditions() {
    if (this.details.termsAndCondition && this.details.termsAndCondition.length) {
      this.packetImages.termsAndConditions = []
      this.details.termsAndConditionUrl.forEach((element, index) => {
        this.packetImages.termsAndConditions.push({ path: this.details.termsAndCondition[index], URL: element, name: null })
      });
    }
  }

}
