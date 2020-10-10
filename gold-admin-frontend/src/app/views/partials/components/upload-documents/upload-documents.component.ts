import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, SimpleChanges, Output, EventEmitter, ChangeDetectionStrategy, ApplicationRef, HostListener, ElementRef, Renderer } from '@angular/core';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { map, finalize } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ImagePreviewDialogComponent } from '../../../../views/partials/components/image-preview-dialog/image-preview-dialog.component';
import { MatDialog } from '@angular/material';
import { PdfViewerComponent } from '../../../../views/partials/components/pdf-viewer/pdf-viewer.component';
import { Router } from '@angular/router';
import { LoanApplicationFormService } from '../../../../core/loan-management';
import { ScrapApplicationFormService } from '../../../../core/scrap-management';
import { StandardDeductionService } from '../../../../core/scrap-management/standard-deduction/service/standard-deduction.service';
import { LoanTransferService } from '../../../../core/loan-management/loan-transfer/services/loan-transfer.service';
import { GlobalSettingService } from '../../../../core/global-setting/services/global-setting.service';
import { NgxPermissionsService } from 'ngx-permissions';
import printJS from 'print-js';

@Component({
  selector: 'kt-upload-documents',
  templateUrl: './upload-documents.component.html',
  styleUrls: ['./upload-documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadDocumentsComponent implements OnInit {
  @Output() next: EventEmitter<any> = new EventEmitter();
  @Output() stage: EventEmitter<any> = new EventEmitter();
  @Output() processingChrgs: EventEmitter<any> = new EventEmitter();
  @Input() loanDocumnets
  @Input() scrapDocuments
  @Input() acknowledgmentDocuments;
  @Input() masterAndLoanIds;
  @Input() scrapIds;
  @Input() loanTransfer
  @Input() showButton
  @Input() totalAmt;
  @Input() showLoanFlag;
  @Input() showLoanTransferFlag;
  @Input() showScrapFlag;
  @Input() showScrapAcknowledgementFlag;
  @Input() standardDeductionArr
  @Input() loanStage
  @Input() scrapStage
  @Input() scrapAcknowledgmentStage
  @ViewChild('loanAgreementCopy', { static: false }) loanAgreementCopy
  @ViewChild('pawnCopy', { static: false }) pawnCopy
  @ViewChild('schemeConfirmationCopy', { static: false }) schemeConfirmationCopy
  @ViewChild('signedCheque', { static: false }) signedCheque
  @ViewChild('declaration', { static: false }) declaration
  @ViewChild('xrfMachineReading', { static: false }) xrfMachineReading
  @ViewChild('customerConfirmation', { static: false }) customerConfirmation
  @ViewChild('purchaseVoucher', { static: false }) purchaseVoucher
  @ViewChild('purchaseInvoice', { static: false }) purchaseInvoice
  @ViewChild('saleInvoice', { static: false }) saleInvoice
  pdf = {
    loanAgreementCopy: false,
    pawnCopy: false,
    schemeConfirmationCopy: false,
    signedCheque: false,
    declaration: false,
    customerConfirmation: false,
    purchaseVoucher: false,
    purchaseInvoice: false,
    saleInvoice: false
  }
  documentsForm: FormGroup
  total;
  show: boolean;
  url: string;
  scrapUrl: string;
  buttonName: string;
  buttonValue = 'Next';
  isEdit: boolean;
  globalValue: any;
  showCustomerConfirmationFlag: boolean;
  images = { pawnCopy: [] }

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    public router: Router,
    public loanService: LoanApplicationFormService,
    private ref: ChangeDetectorRef,
    private loanTransferFormService: LoanTransferService,
    private scrapApplicationFormService: ScrapApplicationFormService,
    private el: ElementRef,
    private renderer: Renderer,
    private ngxPermission: NgxPermissionsService,
    public globalSettingService: GlobalSettingService,
  ) {
    this.url = (this.router.url.split("/")[3]).split("?")[0]
    this.scrapUrl = (this.router.url.split("/")[2]).split("?")[0];
    // if (this.url == "loan-transfer") {
    //   this.show = true
    // } else {
    //   this.show = false
    // }
    if (this.url == "view-loan" || this.url == "view-scrap") {
      this.isEdit = false
    } else {
      this.isEdit = true
    }
    this.ngxPermission.permissions$.subscribe(res => {
      if ((this.url == "loan-transfer" && (res.loanTransferAppraiserRating || res.loanTransferRating)) || this.url == "scrap-buying-application-form" || this.url == "view-loan" || this.url == "view-scrap") {
        this.buttonValue = 'next';
      } else {
        this.buttonValue = 'save';
      }
    })
    this.initForm()
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.standardDeductionArr && changes.standardDeductionArr) {
      this.standardDeductionArr = changes.standardDeductionArr.currentValue
    }
    if (changes.loanStage && changes.loanStage.currentValue) {
      if (changes.loanStage.currentValue.id != 8) {
        this.isEdit = false
        this.buttonValue = 'Next'
      }
    }
    if (changes.scrapStage && changes.scrapStage.currentValue) {
      if (changes.scrapStage.currentValue.id != 8) {
        this.isEdit = false
        this.buttonValue = 'Next'
      }
      if (changes.scrapStage.currentValue.id == 9 || changes.scrapStage.currentValue.id == 10) {
        setTimeout(() => {
          this.documentsForm.disable();
        });
      }
    }
    if (changes.scrapAcknowledgmentStage && changes.scrapAcknowledgmentStage.currentValue) {
      if (changes.scrapAcknowledgmentStage.currentValue.id == 9 || changes.scrapAcknowledgmentStage.currentValue.id == 10) {
        setTimeout(() => {
          this.documentsForm.disable();
        });
      }
    }
    if (changes.loanDocumnets && changes.loanDocumnets.currentValue) {
      let documents = changes.loanDocumnets.currentValue.customerLoanDocument

      if (documents && documents.pawnCopyImage.length) {
        this.documentsForm.patchValue({
          pawnCopyImage: documents.pawnCopyImage,
          schemeConfirmationCopyImage: documents.schemeConfirmationCopyImage[0],
          loanAgreementCopyImage: documents.loanAgreementCopyImage[0],
          loanAgreementCopy: documents.loanAgreementCopy,
          pawnCopy: documents.pawnCopy,
          schemeConfirmationCopy: documents.schemeConfirmationCopy,
        })
        documents.pawnCopyImage.forEach(element => {
          this.images.pawnCopy.push({ path: '', originalname: '', URL: element })
        });
        this.pdfCheck();
      }
    }
    if (changes.acknowledgmentDocuments && changes.acknowledgmentDocuments.currentValue) {
      let documents = changes.acknowledgmentDocuments.currentValue.customerScrapAcknowledgement
      if (documents) {
        this.documentsForm.patchValue({
          processingCharges: documents.processingCharges,
          standardDeduction: documents.standardDeduction,
          customerConfirmationStatus: documents.customerConfirmationStatus
        })
        this.calculateAfterDeduction();
        if (documents.customerConfirmation) {
          this.documentsForm.patchValue({
            customerConfirmation: documents.customerConfirmation,
            customerConfirmationImage: documents.customerConfirmationImage[0],
          })
        }
        this.pdfCheck();
        if (changes.acknowledgmentDocuments.currentValue.scrapStatusForAppraiser == 'approved') {
          this.isEdit = false
          this.documentsForm.disable()
        }
        this.ref.detectChanges()
      }
    }
    if (changes.scrapDocuments && changes.scrapDocuments.currentValue) {
      let documents = changes.scrapDocuments.currentValue.scrapDocument
      if (documents && documents.purchaseVoucherImage.length) {
        if (documents.purchaseVoucher) {
          this.documentsForm.patchValue({
            purchaseVoucher: documents.purchaseVoucher,
            purchaseVoucherImage: documents.purchaseVoucherImage[0],
          })
        }
        if (documents.purchaseInvoice) {
          this.documentsForm.patchValue({
            purchaseInvoice: documents.purchaseInvoice,
            purchaseInvoiceImage: documents.purchaseInvoiceImage[0],
          })
        }
        if (documents.saleInvoice) {
          this.documentsForm.patchValue({
            saleInvoice: documents.saleInvoice,
            saleInvoiceImage: documents.saleInvoiceImage[0],
          })
        }
        this.pdfCheck();
      }
    }
    if (changes.loanTransfer && changes.loanTransfer.currentValue) {
      let documents = changes.loanTransfer.currentValue.masterLoan.loanTransfer
      if (documents && documents.declaration) {
        this.documentsForm.patchValue({
          declarationCopyImage: documents.declarationImage[0],
          signedChequeImage: documents.signedChequeImage[0],
          pawnCopyImage: documents.pawnTicketImage,
          pawnCopy: documents.pawnTicket,
          outstandingLoanAmount: documents.outstandingLoanAmount,
          declaration: documents.declaration,
          signedCheque: documents.signedCheque
        })
        this.pdfCheck()
        if (documents.loanTransferStatusForAppraiser == 'approved') {
          this.isEdit = false
          this.documentsForm.disable()
          this.ref.detectChanges();

        }
      }
    }
    if (changes.totalAmt) {
      if (Number(changes.totalAmt.currentValue) && this.globalValue) {
        const calculateProcessingCharges = Math.round(this.totalAmt * this.globalValue.processingChargesInPercent / 100);
        if (calculateProcessingCharges > this.globalValue.processingChargesFixed) {
          this.controls.processingCharges.patchValue(calculateProcessingCharges);
        } else {
          this.controls.processingCharges.patchValue(this.globalValue.processingChargesFixed);
        }
      }
    }
  }

  pdfCheck() {
    Object.keys(this.documentsForm.value).forEach(value => {
      let pdf = this.documentsForm.value[value]

      let ext = [];
      if (typeof pdf == 'string' && pdf) {
        ext = pdf.split('.')
      } else if (typeof pdf == 'object' && pdf) {
        ext = pdf[0].split('.')
      }

      if (ext && ext[ext.length - 1] == 'pdf') {
        this.pdf[value] = true
        this.ref.detectChanges()
      } else {
        this.pdf[value] = false
      }
    })
  }

  ngOnInit() {
    if (this.showLoanFlag || this.showLoanTransferFlag || this.showScrapFlag || this.showScrapAcknowledgementFlag) {
      this.validation()
    }
  }

  ngAfterViewInit() {
    if (this.showScrapAcknowledgementFlag) {
      this.globalSettingService.getScrapGlobalSetting().subscribe(global => {
        console.log(global)
        this.globalValue = global
        // this.globalValue.beforeSD = this.globalValue.;
        // this.globalValue.afterSD = 10;
        this.documentsForm.controls.standardDeduction.setValidators
          ([Validators.min(this.globalValue.standardDeductionMin),
          Validators.max(this.globalValue.standardDeductionMax), Validators.required]);
        this.documentsForm.controls.standardDeduction.updateValueAndValidity();
      });
    }

    if (this.scrapUrl == "scrap-management") {
      this.documentsForm.controls['customerConfirmationStatus'].valueChanges.subscribe((val) => {
        if (val == 'confirmed') {
          this.buttonValue = 'Next';
          this.showCustomerConfirmationFlag = true;
          this.documentsForm.controls.customerConfirmation.setValidators(Validators.required),
            this.documentsForm.controls.customerConfirmation.updateValueAndValidity()
        } else {
          this.buttonValue = 'Save';
          this.showCustomerConfirmationFlag = false;
          this.documentsForm.patchValue({
            customerConfirmation: null,
            customerConfirmationImage: null,
            customerConfirmationImageName: null,
          })
          this.documentsForm.controls.customerConfirmation.setValidators([]),
            this.documentsForm.controls.customerConfirmation.updateValueAndValidity()
        }
      });
    }
  }

  initForm() {
    this.documentsForm = this.fb.group({
      loanAgreementCopy: [],
      pawnCopy: [, Validators.required],
      schemeConfirmationCopy: [],
      signedCheque: [],
      declaration: [],
      loanAgreementImageName: [],
      pawnCopyImageName: [],
      schemeConfirmationCopyImageName: [],
      signedChequeImageName: [],
      declarationCopyImageName: [],
      signedChequeImage: [],
      declarationCopyImage: [],
      outstandingLoanAmount: [],
      loanAgreementCopyImage: [],
      pawnCopyImage: [],
      schemeConfirmationCopyImage: [],
      //acknowledgment
      processingCharges: [],
      standardDeduction: [],
      customerConfirmation: [],
      customerConfirmationImage: [],
      customerConfirmationImageName: [],
      customerConfirmationStatus: [],
      //scrap
      purchaseVoucher: [],
      purchaseVoucherImage: [],
      purchaseVoucherImageName: [],
      purchaseInvoice: [],
      purchaseInvoiceImage: [],
      purchaseInvoiceImageName: [],
      saleInvoice: [],
      saleInvoiceImage: [],
      saleInvoiceImageName: [],
    })
    this.validation()
  }

  get controls() {
    return this.documentsForm.controls
  }

  validation() {
    if (this.showLoanTransferFlag) {
      this.documentsForm.controls.signedCheque.setValidators(Validators.required),
        this.documentsForm.controls.signedCheque.updateValueAndValidity()
      this.documentsForm.controls.declaration.setValidators(Validators.required),
        this.documentsForm.controls.declaration.updateValueAndValidity()
      this.documentsForm.controls.outstandingLoanAmount.setValidators(Validators.required),
        this.documentsForm.controls.outstandingLoanAmount.updateValueAndValidity()
    } else if (this.showScrapAcknowledgementFlag) {
      this.documentsForm.controls.pawnCopy.setValidators([]),
        this.documentsForm.controls.pawnCopy.updateValueAndValidity()
      this.documentsForm.controls.processingCharges.setValidators(Validators.required),
        this.documentsForm.controls.processingCharges.updateValueAndValidity()
      this.documentsForm.controls.standardDeduction.setValidators(Validators.required),
        this.documentsForm.controls.standardDeduction.updateValueAndValidity()
      this.documentsForm.controls.customerConfirmationStatus.setValidators(Validators.required),
        this.documentsForm.controls.customerConfirmationStatus.updateValueAndValidity()
    } else if (this.showScrapFlag) {
      this.documentsForm.controls.pawnCopy.setValidators([]),
        this.documentsForm.controls.pawnCopy.updateValueAndValidity()
      this.documentsForm.controls.purchaseVoucher.setValidators(Validators.required),
        this.documentsForm.controls.purchaseVoucher.updateValueAndValidity()
    } else if (this.showLoanFlag) {
      this.documentsForm.controls.loanAgreementCopy.setValidators(Validators.required),
        this.documentsForm.controls.loanAgreementCopy.updateValueAndValidity()
      this.documentsForm.controls.schemeConfirmationCopy.setValidators(Validators.required),
        this.documentsForm.controls.schemeConfirmationCopy.updateValueAndValidity()
    }
  }

  fileUpload(event, value) {
    var name = event.target.files[0].name
    var ext = name.split('.')
    if (ext[ext.length - 1] == 'jpg' || ext[ext.length - 1] == 'png'
      || ext[ext.length - 1] == 'jpeg' || ext[ext.length - 1] == 'pdf') {
      const controls = this.documentsForm.controls;
      let params;
      if (this.showScrapAcknowledgementFlag) {
        params = {
          reason: 'acknowledgement',
          scrapId: this.scrapIds.scrapId
        }
      } else if (this.showScrapFlag) {
        params = {
          reason: 'customerDocumentDetails',
          scrapId: this.scrapIds.scrapId
        }
      } else {
        params = {
          reason: 'loan',
          masterLoanId: this.masterAndLoanIds.masterLoanId
        }
      }
      this.sharedService.uploadFile(event.target.files[0], params).pipe(
        map(res => {
          if (value == 'loanAgreementCopy') {
            controls.loanAgreementCopy.patchValue([res.uploadFile.path])
            controls.loanAgreementImageName.patchValue(res.uploadFile.originalname)
            controls.loanAgreementCopyImage.patchValue(res.uploadFile.URL)
          } else if (value == 'pawnCopy' && this.images.pawnCopy.length < 2) {
            this.images.pawnCopy.push({ path: res.uploadFile.path, originalname: res.uploadFile.originalname, URL: res.uploadFile.URL })
            controls.pawnCopy.patchValue(this.getPathArray('pawnCopy'))
            controls.pawnCopyImageName.patchValue(res.uploadFile.originalname)
            controls.pawnCopyImage.patchValue(this.getURLArray('pawnCopy'))
            console.log({ pawnCopy: controls.pawnCopy.value, images: this.images })
          } else if (value == 'schemeConfirmationCopy') {
            controls.schemeConfirmationCopy.patchValue([res.uploadFile.path])
            controls.schemeConfirmationCopyImageName.patchValue(res.uploadFile.originalname)
            controls.schemeConfirmationCopyImage.patchValue(res.uploadFile.URL)
          } else if (value == 'signedCheque') {
            controls.signedCheque.patchValue([res.uploadFile.path])
            controls.signedChequeImageName.patchValue(res.uploadFile.originalname)
            controls.signedChequeImage.patchValue(res.uploadFile.URL)
          } else if (value == 'declaration') {
            controls.declaration.patchValue([res.uploadFile.path])
            controls.declarationCopyImageName.patchValue(res.uploadFile.originalname)
            controls.declarationCopyImage.patchValue(res.uploadFile.URL)
          } else if (value == 'customerConfirmation') {
            controls.customerConfirmation.patchValue([res.uploadFile.path])
            controls.customerConfirmationImageName.patchValue(res.uploadFile.originalname)
            controls.customerConfirmationImage.patchValue(res.uploadFile.URL)
          } else if (value == 'purchaseVoucher') {
            controls.purchaseVoucher.patchValue([res.uploadFile.path])
            controls.purchaseVoucherImageName.patchValue(res.uploadFile.originalname)
            controls.purchaseVoucherImage.patchValue(res.uploadFile.URL)
          } else if (value == 'purchaseInvoice') {
            controls.purchaseInvoice.patchValue([res.uploadFile.path])
            controls.purchaseInvoiceImageName.patchValue(res.uploadFile.originalname)
            controls.purchaseInvoiceImage.patchValue(res.uploadFile.URL)
          } else if (value == 'saleInvoice') {
            controls.saleInvoice.patchValue([res.uploadFile.path])
            controls.saleInvoiceImageName.patchValue(res.uploadFile.originalname)
            controls.saleInvoiceImage.patchValue(res.uploadFile.URL)
          } else {
            this.toastr.error('Cannot upload more than 2 attachments')
          }
          if (ext[ext.length - 1] == 'pdf') {
            this.pdf[value] = true
          } else {
            this.pdf[value] = false
          }
        }), finalize(() => {
          this[value].nativeElement.value = ''
          this.ref.detectChanges()
        })).subscribe()
    }
    else {
      this.toastr.error('Upload Valid File Format');
    }
  }

  preview(value) {
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
      this.dialog.open(ImagePreviewDialogComponent, {
        data: {
          images: [value],
          index: 0
        },
        width: "auto"
      })
    }

  }

  editImages(value) {
    this[value].nativeElement.click()
  }

  ExportAsPdf() {
    if (this.showScrapAcknowledgementFlag) {
      this.scrapApplicationFormService.getCustomerAcknowledgementPdf(this.scrapIds.scrapId).subscribe()
    } else if (this.showScrapFlag) {
      this.scrapApplicationFormService.getPurchaseVoucherPdf(this.scrapIds.scrapId).subscribe()
    } else {
      this.loanService.getPdf(this.masterAndLoanIds.masterLoanId).subscribe()
    }
  }

  calculateAfterDeduction() {
    const controls = this.documentsForm as FormGroup;
    if (controls.controls.standardDeduction.valid && controls.controls.standardDeduction.value) {
      let standardDeduction = controls.controls.standardDeduction.value
      this.total = (this.totalAmt - (this.totalAmt * standardDeduction / 100))
      console.log(this.total)
    }
    console.log(this.documentsForm.value);
  }

  save() {
    // loan transfer
    if (!this.isEdit && this.documentsForm.status == 'DISABLED') {
      this.next.emit(3)
      return
    }

    // loan
    if (!this.isEdit) {
      if (this.showScrapAcknowledgementFlag) {
        this.next.emit(3)
      } else {
        this.next.emit(7)
      }
      return
    }

    if (this.documentsForm.invalid) {
      this.documentsForm.markAllAsTouched()
      return
    }
    if (this.url == 'loan-transfer') {
      this.loanTransferFormService.uploadDocuments(this.documentsForm.value, this.masterAndLoanIds).pipe(
        map(res => {
          // if(this.buttonName == 'save'){
          //   this.router.navigate(['/admin/loan-management/transfer-loan-list'])
          // }else{
          if (res.loanCurrentStage) {
            let stage = Number(res.loanCurrentStage) - 1
            this.stage.emit(res.loanCurrentStage)
            this.next.emit(stage)
            // }
          }
        })).subscribe()
    } else if (this.url == 'scrap-buying-application-form') {
      this.scrapApplicationFormService.acknowledgementSubmit(this.documentsForm.value, this.scrapIds).pipe(
        map(res => {
          if (this.buttonValue == 'Next') {
            if (res.scrapCurrentStage) {
              let stage = Number(res.scrapCurrentStage) - 1
              this.stage.emit(res.scrapCurrentStage)
              this.next.emit(stage)
              this.processingChrgs.emit(res.processingCharges)
            }
          } else {
            this.toastr.success(res.message)
            this.router.navigate(['/admin/scrap-management/applied-scrap'])
          }
        })).subscribe();
    } else if (this.showScrapFlag) {
      this.scrapApplicationFormService.uploadDocuments(this.documentsForm.value, this.scrapIds).pipe(
        map(res => {
          this.toastr.success(res.message)
          this.router.navigate(['/admin/scrap-management/applied-scrap'])
        })).subscribe();
    } else {
      this.loanService.uploadDocuments(this.documentsForm.value, this.masterAndLoanIds).pipe(
        map(res => {
          this.toastr.success(res.message)
          this.router.navigate(['/admin/loan-management/applied-loan'])
        })).subscribe();
    }
  }

  getPathArray(type: string) {
    const pathArray = this.images[type].map(e => e.path)
    return pathArray
  }

  getURLArray(type: string) {
    const urlArray = this.images[type].map(e => e.URL)
    return urlArray
  }

  getNameArray(type: string) {
    const nameArray = this.images[type].map(e => e.URL)
    return nameArray
  }

  remove(type, index) {
    this.images[type].splice(index, 1)
    if (type == 'pawnCopy') {
      this.documentsForm.patchValue({
        pawnCopy: this.getPathArray(type),
        pawnCopyImage: this.getURLArray(type),
        pawnCopyImageName: this.images.pawnCopy.length ? this.images.pawnCopy[0].originalname : ''
      })
    }
    console.log(this.images, this.controls.pawnCopyImage)
  }

  isPdf(image: string): boolean {
    const ext = this.sharedService.getExtension(image)
    const isPdf = ext == 'pdf' ? true : false
    return isPdf
  }
}
