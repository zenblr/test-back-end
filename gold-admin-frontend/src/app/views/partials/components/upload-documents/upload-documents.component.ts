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
import { LoanTransferService } from '../../../../core/loan-management/loan-transfer/services/loan-transfer.service';
import { values } from 'lodash';
import { NgxPermission } from 'ngx-permissions/lib/model/permission.model';
import { NgxPermissionsService } from 'ngx-permissions';
import { ScrapApplicationFormService } from '../../../../core/scrap-management';
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
  @Input() loanDocumnets
  @Input() masterAndLoanIds;
  @Input() scrapIds;
  @Input() loanTransfer
  @Input() showButton
  @ViewChild('loanAgreementCopy', { static: false }) loanAgreementCopy
  @ViewChild('pawnCopy', { static: false }) pawnCopy
  @ViewChild('schemeConfirmationCopy', { static: false }) schemeConfirmationCopy
  @ViewChild('signedCheque', { static: false }) signedCheque
  @ViewChild('declaration', { static: false }) declaration
  @ViewChild('xrfMachineReading', { static: false }) xrfMachineReading
  @ViewChild('customerConfirmation', { static: false }) customerConfirmation
  pdf = {
    loanAgreementCopy: false,
    pawnCopy: false,
    schemeConfirmationCopy: false,
    signedCheque: false,
    declaration: false,
    customerConfirmation: false
  }
  documentsForm: FormGroup
  show: boolean;
  showLoanFlag = false;
  showLoanTransferFlag = false;
  showScrapFlag = false;
  url: string;
  buttonName: string;
  isEdit: boolean;
  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    public router: Router,
    public loanService: LoanApplicationFormService,
    private ref: ChangeDetectorRef,
    private loanTransferFormService: LoanTransferService,
    private el: ElementRef,
    private renderer: Renderer,
    private ngxPermission: NgxPermissionsService,
    public scrapApplicationFormService: ScrapApplicationFormService,
  ) {
    this.url = (this.router.url.split("/")[3]).split("?")[0]
    if (this.url == "loan-transfer") {
      this.showLoanTransferFlag = true;
    } else if (this.url == "scrap-buying-application-form") {
      this.showScrapFlag = true;
    } else {
      this.showLoanFlag = true;
    }
    if (this.url == "view-loan") {
      this.isEdit = false
    } else {
      this.isEdit = true
    }
    this.ngxPermission.permissions$.subscribe(res => {
      if (this.url == "loan-transfer" && res.loanTransferRating) {
        this.buttonName = 'next';
      } else if (this.url == "scrap-buying-application-form") {
        this.buttonName = 'next';
      } else {
        this.buttonName = 'save';
      }
    })
    this.initForm()
    console.log(this.url);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.loanDocumnets && changes.loanDocumnets.currentValue) {
      let documents = changes.loanDocumnets.currentValue.customerLoanDocument

      if (documents && documents.pawnCopyImage.length) {
        this.documentsForm.patchValue({
          pawnCopyImage: documents.pawnCopyImage[0],
          schemeConfirmationCopyImage: documents.schemeConfirmationCopyImage[0],
          loanAgreementCopyImage: documents.loanAgreementCopyImage[0],
          loanAgreementCopy: documents.loanAgreementCopyImage[0],
          pawnCopy: documents.pawnCopyImage[0],
          schemeConfirmationCopy: documents.schemeConfirmationCopyImage[0],
        })
        this.pdfCheck();
        this.isEdit = false
      }
    }
    if (changes.loanTransfer && changes.loanTransfer.currentValue) {
      let documents = changes.loanTransfer.currentValue.masterLoan.loanTransfer
      if (documents && documents.declaration) {
        this.documentsForm.patchValue({
          declarationCopyImage: documents.declarationImage[0],
          signedChequeImage: documents.signedChequeImage[0],
          pawnCopyImage: documents.pawnTicketImage[0],
          pawnCopy: documents.pawnTicket,
          outstandingLoanAmount: documents.outstandingLoanAmount,
          declaration: documents.declaration,
          signedCheque: documents.signedCheque
        })
        this.pdfCheck()
        if (documents.loanTransferStatusForAppraiser == 'approved') {
          this.isEdit = false
          this.documentsForm.disable()
          this.ref.detectChanges()
        }
      }
    }
  }

  pdfCheck() {
    Object.keys(this.documentsForm.value).forEach(value => {
      console.log()
      let pdf = this.documentsForm.value[value]
      if (typeof pdf == 'string' && pdf) {
        let ext = pdf.split('.')
        console.log(ext)
        if (ext[ext.length - 1] == 'pdf') {
          this.pdf[value] = true
          this.ref.detectChanges()
        } else {
          this.pdf[value] = false
        }
        console.log(value)
      }
    })
  }

  ngOnInit() {

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
      approxPurityReading: [],
      xrfMachineReading: [],
      xrfMachineReadingImage: [],
      xrfMachineReadingImageName: [],
      customerConfirmation: [],
      customerConfirmationImage: [],
      customerConfirmationImageName: []
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
    } else if (this.showScrapFlag) {
      this.documentsForm.controls.pawnCopy.setValidators([]),
        this.documentsForm.controls.pawnCopy.updateValueAndValidity(),
        this.documentsForm.controls.approxPurityReading.setValidators(Validators.required),
        this.documentsForm.controls.approxPurityReading.updateValueAndValidity(),
        this.documentsForm.controls.xrfMachineReading.setValidators(Validators.required),
        this.documentsForm.controls.xrfMachineReading.updateValueAndValidity()
      this.documentsForm.controls.customerConfirmation.setValidators(Validators.required),
        this.documentsForm.controls.customerConfirmation.updateValueAndValidity()
    } else {
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
      if (this.scrapIds) {
        params = {
          reason: 'acknowledgement',
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
          } else if (value == 'pawnCopy') {
            controls.pawnCopy.patchValue([res.uploadFile.path])
            controls.pawnCopyImageName.patchValue(res.uploadFile.originalname)
            controls.pawnCopyImage.patchValue(res.uploadFile.URL)
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
          } else if (value == 'xrfMachineReading') {
            controls.xrfMachineReading.patchValue(res.uploadFile.path)
            controls.xrfMachineReadingImageName.patchValue(res.uploadFile.originalname)
            controls.xrfMachineReadingImage.patchValue(res.uploadFile.URL)
          } else if (value == 'customerConfirmation') {
            controls.customerConfirmation.patchValue(res.uploadFile.path)
            controls.customerConfirmationImageName.patchValue(res.uploadFile.originalname)
            controls.customerConfirmationImage.patchValue(res.uploadFile.URL)
          }
          if (ext[ext.length - 1] == 'pdf') {
            this.pdf[value] = true
          } else {
            this.pdf[value] = false
          }
          console.log(this.pdf)
        }), finalize(() => {
          this[value].nativeElement.value = ''
          this.ref.detectChanges();
        })).subscribe();
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
    var someJSONdata = [
      {
        field1: 'John Doe',
        value1: 'john@doe.com',
        field2: '111-111-1111',
        value2: 'text'
      },
      {
        field1: 'Barry Allen',
        value1: 'barry@flash.com',
        field2: '222-222-2222',
        value2: 'text'
      },
      {
        field1: 'Cool Dude',
        value1: 'cool@dude.com',
        field2: '333-333-3333',
        value2: 'text'
      }
    ]
    printJS('print', 'html')
  }

  save() {

    // loan transfer
    if (!this.isEdit && this.documentsForm.status == 'DISABLED') {
      this.next.emit(3)
      return
    }

    // loan 
    if (!this.isEdit) {
      this.next.emit(7)
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
    } else {
      this.loanService.uploadDocuments(this.documentsForm.value, this.masterAndLoanIds).pipe(
        map(res => {
          this.toastr.success(res.message)
          this.router.navigate(['/admin/loan-management/applied-loan'])
        })).subscribe();
    }
  }
}
