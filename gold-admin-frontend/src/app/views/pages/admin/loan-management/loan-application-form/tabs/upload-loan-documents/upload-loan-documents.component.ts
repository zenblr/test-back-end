import { Component, OnInit, Input, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SharedService } from '../../../../../../../core/shared/services/shared.service';
import { map, finalize } from 'rxjs/operators';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ImagePreviewDialogComponent } from '../../../../../../../views/partials/components/image-preview-dialog/image-preview-dialog.component';
import { MatDialog } from '@angular/material';
import { PdfViewerComponent } from '../../../../../../../views/partials/components/pdf-viewer/pdf-viewer.component';
import { Router } from '@angular/router';
import { values } from 'lodash';

@Component({
  selector: 'kt-upload-loan-documents',
  templateUrl: './upload-loan-documents.component.html',
  styleUrls: ['./upload-loan-documents.component.scss']
})
export class UploadLoanDocumentsComponent implements OnInit {


  @Input() masterAndLoanIds;
  @ViewChild('loanAgreementCopy',{static:false}) loanAgreementCopy
  @ViewChild('pawnTicket',{static:false}) pawnTicket
  @ViewChild('schemeConfirmation',{static:false}) schemeConfirmation
  @ViewChild('signedCheque',{static:false}) signedCheque
  @ViewChild('declartionCopy',{static:false}) declartionCopy
  pdf = {
    loanAgreementCopy: false,
    pawnTicket: false,
    schemeConfirmation: false,
    signedCheque: false,
    declartionCopy: false
  }
  documentsForm: FormGroup
  show: boolean;
  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    public router: Router,
    private ref: ChangeDetectorRef
  ) {
    if (this.router.url == "/admin/loan-management/loan-transfer") {
      this.show = true
    } else {
      this.show = false
    }
  }



  ngOnInit() {
    this.documentsForm = this.fb.group({
      loanAgreementCopy: [],
      pawnTicket: [],
      schemeConfirmation: [],
      signedCheque: [],
      declartionCopy: [],
      loanAgreementImageName: [],
      pawnTicketImageName: [],
      schemeConfirmationImageName: [],
      signedChequeImageName: [],
      declarationCopyImageName: []
    })
  }

  fileUpload(event, value) {
    var name = event.target.files[0].name
    var ext = name.split('.')
    if (ext[ext.length - 1] == 'jpg' || ext[ext.length - 1] == 'png'
      || ext[ext.length - 1] == 'jpeg' || ext[ext.length - 1] == 'pdf') {
      const controls = this.documentsForm.controls
      const params = {
        reason: 'loan'
      }


      this.sharedService.uploadFile(event.target.files[0], params).pipe(
        map(res => {
          if (value == 'loanAgreementCopy') {
            controls.loanAgreementCopy.patchValue(res.uploadFile.URL)
            controls.loanAgreementImageName.patchValue(res.uploadFile.originalname)
          } else if (value == 'pawnTicket') {
            controls.pawnTicket.patchValue(res.uploadFile.URL)
            controls.pawnTicketImageName.patchValue(res.uploadFile.originalname)

          } else if (value == 'schemeConfirmation') {
            controls.schemeConfirmation.patchValue(res.uploadFile.URL)
            controls.schemeConfirmationImageName.patchValue(res.uploadFile.originalname)
          } else if (value == 'signedCheque') {
            controls.signedCheque.patchValue(res.uploadFile.URL)
            controls.signedChequeImageName.patchValue(res.uploadFile.originalname)

          } else if (value == 'declartionCopy') {
            controls.declartionCopy.patchValue(res.uploadFile.URL)
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
    var ext = value.split('.')
    if (ext[ext.length - 1] == 'pdf') {

      this.dialog.open(PdfViewerComponent, {
        data: {
          pdfSrc:value,
          page:1,
          showAll:true
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

}