import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, SimpleChanges } from '@angular/core';
import { SharedService } from '../../../../../../../core/shared/services/shared.service';
import { map, finalize } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ImagePreviewDialogComponent } from '../../../../../../../views/partials/components/image-preview-dialog/image-preview-dialog.component';
import { MatDialog } from '@angular/material';
import { PdfViewerComponent } from '../../../../../../../views/partials/components/pdf-viewer/pdf-viewer.component';
import { Router } from '@angular/router';
import { LoanApplicationFormService } from '../../../../../../../core/loan-management';

@Component({
  selector: 'kt-upload-loan-documents',
  templateUrl: './upload-loan-documents.component.html',
  styleUrls: ['./upload-loan-documents.component.scss']
})
export class UploadLoanDocumentsComponent implements OnInit {

  @Input() loanDocumnets
  @Input() masterAndLoanIds;
  @ViewChild('loanAgreementCopy', { static: false }) loanAgreementCopy
  @ViewChild('pawnCopy', { static: false }) pawnCopy
  @ViewChild('schemeConfirmationCopy', { static: false }) schemeConfirmationCopy
  @ViewChild('signedCheque', { static: false }) signedCheque
  @ViewChild('declartionCopy', { static: false }) declartionCopy
  pdf = {
    loanAgreementCopy: false,
    pawnCopy: false,
    schemeConfirmationCopy: false,
    signedCheque: false,
    declartionCopy: false
  }
  documentsForm: FormGroup
  show: boolean;
  url: string;
  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    public router: Router,
    public loanService: LoanApplicationFormService,
    private ref: ChangeDetectorRef
  ) {
    
    if (this.router.url == "/admin/loan-management/loan-transfer") {
      this.show = true
    } else {
      this.show = false
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.loanDocumnets && changes.loanDocumnets.currentValue) {
      let documents = changes.loanDocumnets.currentValue.customerLoanDocument
      if (documents) {
        this.documentsForm.patchValue({
          loanAgreementCopy: documents.loanAgreementCopyImage,
          pawnCopy: documents.pawnCopyImage,
          schemeConfirmationCopy: documents.schemeConfirmationCopyImage,
        })
      }
    }
  }


  ngOnInit() {
    this.url = this.router.url.split('/')[3]
    this.documentsForm = this.fb.group({
      loanAgreementCopy: [],
      pawnCopy: [],
      schemeConfirmationCopy: [],
      signedCheque: [],
      declartionCopy: [],
      loanAgreementImageName: [],
      pawnCopyImageName: [],
      schemeConfirmationCopyImageName: [],
      signedChequeImageName: [],
      declarationCopyImageName: []
    })
    this.validation()
  }

  get controls() {
    return this.documentsForm.controls
  }

  validation() {
    if (this.show) {
      this.documentsForm.controls.loanAgreementCopy.setValidators(Validators.required),
        this.documentsForm.controls.loanAgreementCopy.updateValueAndValidity()
      this.documentsForm.controls.pawnCopy.setValidators(Validators.required),
        this.documentsForm.controls.pawnCopy.updateValueAndValidity()
      this.documentsForm.controls.schemeConfirmationCopy.setValidators(Validators.required),
        this.documentsForm.controls.schemeConfirmationCopy.updateValueAndValidity()

    } else {
      this.documentsForm.controls.signedCheque.setValidators(Validators.required),
        this.documentsForm.controls.signedCheque.updateValueAndValidity()
      this.documentsForm.controls.declartionCopy.setValidators(Validators.required),
        this.documentsForm.controls.declartionCopy.updateValueAndValidity()
    }
  }

  fileUpload(event, value) {
    var name = event.target.files[0].name
    var ext = name.split('.')
    if (ext[ext.length - 1] == 'jpg' || ext[ext.length - 1] == 'png'
      || ext[ext.length - 1] == 'jpeg' || ext[ext.length - 1] == 'pdf') {
      const controls = this.documentsForm.controls
      const params = {
        reason: 'loan',
        masterLoanId: this.masterAndLoanIds.masterLoanId
      }


      this.sharedService.uploadFile(event.target.files[0], params).pipe(
        map(res => {
          if (value == 'loanAgreementCopy') {
            controls.loanAgreementCopy.patchValue([res.uploadFile.path])
            controls.loanAgreementImageName.patchValue(res.uploadFile.originalname)
          } else if (value == 'pawnCopy') {
            controls.pawnCopy.patchValue([res.uploadFile.path])
            controls.pawnCopyImageName.patchValue(res.uploadFile.originalname)

          } else if (value == 'schemeConfirmationCopy') {
            controls.schemeConfirmationCopy.patchValue([res.uploadFile.path])
            controls.schemeConfirmationCopyImageName.patchValue(res.uploadFile.originalname)
          } else if (value == 'signedCheque') {
            controls.signedCheque.patchValue([res.uploadFile.path])
            controls.signedChequeImageName.patchValue(res.uploadFile.originalname)

          } else if (value == 'declartionCopy') {
            controls.declartionCopy.patchValue([res.uploadFile.path])
            controls.declarationCopyImageName.patchValue(res.uploadFile.originalname)
          }
          if (ext[ext.length - 1] == 'pdf') {
            this.pdf[value] = true
          } else {
            this.pdf[value] = false
          }

          console.log(this.pdf)

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
    var ext = value[0].split('.')
    if (ext[ext.length - 1] == 'pdf') {

      this.dialog.open(PdfViewerComponent, {
        data: {
          pdfSrc: value[0],
          page: 1,
          showAll: true
        },
        width: "80%"
      })
    } else {
      this.dialog.open(ImagePreviewDialogComponent, {
        data: {
          images: value,
          index: 0
        },
        width: "auto"
      })
    }

  }

  editImages(value) {
    this[value].nativeElement.click()
  }

  save() {
    this.loanService.uploadDocuments(this.documentsForm.value, this.masterAndLoanIds).pipe(
      map(res => {
        this.toastr.success(res.message)
        this.router.navigate(['/admin/loan-management/applied-loan'])
      })).subscribe()
  }

}
