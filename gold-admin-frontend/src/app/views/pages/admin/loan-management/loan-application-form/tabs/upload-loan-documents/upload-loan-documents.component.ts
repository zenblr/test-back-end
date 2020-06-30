import { Component, OnInit, Input } from '@angular/core';
import { SharedService } from '../../../../../../../core/shared/services/shared.service';
import { map } from 'rxjs/operators';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ImagePreviewDialogComponent } from '../../../../../../../views/partials/components/image-preview-dialog/image-preview-dialog.component';
import { MatDialog } from '@angular/material';
import { PdfViewerComponent } from '../../../../../../../views/partials/components/pdf-viewer/pdf-viewer.component';

@Component({
  selector: 'kt-upload-loan-documents',
  templateUrl: './upload-loan-documents.component.html',
  styleUrls: ['./upload-loan-documents.component.scss']
})
export class UploadLoanDocumentsComponent implements OnInit {

  documentsForm: FormGroup
  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private toastr:ToastrService,
    public dialog:MatDialog
  ) { }

  @Input() loanId;


  ngOnInit() {
    this.documentsForm = this.fb.group({
      loanAgreementCopy: [],
      pawnTicket: [],
      schemeConfirmation: []
    })
  }

  fileUpload(event, value) {
    var name = event.target.files[0].name
    var ext = name.split('.')
    if (ext[ext.length - 1] == 'jpg' || ext[ext.length - 1] == 'png'
      || ext[ext.length - 1] == 'jpeg' || ext[ext.length - 1] == 'pdf') {
      const controls = this.documentsForm.controls
      this.sharedService.uploadFile(event.target.files[0], 'offer').pipe(
        map(res => {
          if (value == 'loanAgreementCopy') {
            controls.loanAgreementCopy.patchValue(res.uploadFile.URL)
          } else if (value == 'pawnTicket') {
            controls.pawnTicket.patchValue(res.uploadFile.URL)

          } else if (value == 'schemeConfirmation') {
            controls.schemeConfirmation.patchValue(res.uploadFile.URL)
          }
          console.log(res)
        })).subscribe()
    }
    else {
      this.toastr.error('Upload Valid File Format');
    }
  }

  preview(value) {
    var ext = value.split('.')
    if (ext[ext.length - 1] == 'pdf'){
      
      this.dialog.open(PdfViewerComponent, {
        data: {
          value
        },
        width: "80%"
      })
    }else{
      this.dialog.open(ImagePreviewDialogComponent, {
        data: {
          images: [value],
          index: 0
        },
        width: "auto"
      })
    }
   
  }

}
