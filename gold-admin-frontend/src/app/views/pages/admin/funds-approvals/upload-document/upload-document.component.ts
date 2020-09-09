import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { map, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { PdfViewerComponent } from '../../../../partials/components/pdf-viewer/pdf-viewer.component';
import { ImagePreviewDialogComponent } from '../../../../partials/components/image-preview-dialog/image-preview-dialog.component';
import { PartReleaseFinalService } from '../../../../../core/funds-approvals/jewellery-release-final/part-release-final/services/part-release-final.service';
import { FullReleaseFinalService } from '../../../../../core/funds-approvals/jewellery-release-final/full-release-final/services/full-release-final.service';

@Component({
  selector: 'kt-upload-document',
  templateUrl: './upload-document.component.html',
  styleUrls: ['./upload-document.component.scss']
})
export class UploadDocumentComponent implements OnInit {
  documentsForm: FormGroup;
  pdf = {
    documents: false,
  }
  @ViewChild('documents', { static: false }) documents
  id: any;
  releaseType: string;
  customerUniqueId: string;
  partReleaseId: string;

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private ref: ChangeDetectorRef,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private partReleaseFinalService: PartReleaseFinalService,
    private fullReleaseFinalService: FullReleaseFinalService,
    private router: Router
  ) {
    this.route.paramMap.subscribe(res => this.id = res.get('id'));
    this.route.paramMap.subscribe(res => this.releaseType = res.get('name'));
    this.route.queryParamMap.subscribe(res => {
      this.customerUniqueId = res.get('customerUniqueId')
      this.partReleaseId = res.get('partReleaseId')
    });
  }

  ngOnInit() {
    this.initForm()
    this.patchForm()
    console.log(this.customerUniqueId, this.partReleaseId)
  }

  initForm() {
    this.documentsForm = this.fb.group({
      partReleaseId: [],
      fullReleaseId: [],
      documents: [, [Validators.required]],
      documentsName: ['', [Validators.required]],
      documentsImage: [, [Validators.required]]
    })
  }

  patchForm() {
    if (this.releaseType === 'partRelease') {
      this.documentsForm.patchValue({ partReleaseId: this.id })
    } else {
      this.documentsForm.patchValue({ fullReleaseId: this.id })
    }
  }

  get controls() {
    return this.documentsForm.controls
  }

  fileUpload(event, value) {
    var name = event.target.files[0].name
    var ext = name.split('.')
    if (ext[ext.length - 1] == 'jpg' || ext[ext.length - 1] == 'png'
      || ext[ext.length - 1] == 'jpeg' || ext[ext.length - 1] == 'pdf') {
      const controls = this.documentsForm.controls

      const params = this.releaseType === 'partRelease' ? { reason: this.releaseType, partReleaseId: this.id } : { reason: this.releaseType, fullReleaseId: this.id };

      // console.log(params)

      this.sharedService.uploadFile(event.target.files[0], params).pipe(
        map(res => {
          if (value == 'documents') {
            controls.documents.patchValue([res.uploadFile.path])
            controls.documentsName.patchValue(res.uploadFile.originalname)
            controls.documentsImage.patchValue(res.uploadFile.URL)
          }
          if (ext[ext.length - 1] == 'pdf') {
            this.pdf[value] = true
          } else {
            this.pdf[value] = false
          }

          // console.log(this.pdf)

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
    let file = value
    if (typeof file == 'object') {
      file = file[0]
    }
    var ext = file.split('.')
    if (ext[ext.length - 1] == 'pdf') {

      this.dialog.open(PdfViewerComponent, {
        data: {
          pdfSrc: file,
          page: 1,
          showAll: true
        },
        width: "80%"
      })

    } else {
      this.dialog.open(ImagePreviewDialogComponent, {
        data: {
          images: [file],
          index: 0
        },
        width: "auto"
      })
    }

  }

  editImages(ref) {
    this[ref].nativeElement.click()
  }

  save() {
    if (this.documentsForm.invalid) {
      return this.documentsForm.markAllAsTouched()
      // return this.toastr.error('Upload Customer Acknowledgement')
    }

    switch (this.releaseType) {
      case 'partRelease':
        this.partReleaseFinalService.uploadDocument(this.documentsForm.value).pipe(
          map(res => {
            this.toastr.success(res['message'])
            // this.router.navigate(['/admin/funds-approvals/part-release-final'])
            this.newLoan()
          })).subscribe()

        break;

      case 'fullRelease':
        this.fullReleaseFinalService.uploadDocument(this.documentsForm.value).pipe(
          map(res => {
            this.toastr.success(res['message'])
            this.router.navigate(['/admin/funds-approvals/full-release-final'])
          })).subscribe()

        break;

      default:
        break;
    }

  }

  newLoan() {
    const params = {
      customerUniqueId: this.customerUniqueId,
      partReleaseId: this.partReleaseId
    }
    this.router.navigate(['/admin/loan-management/loan-application-form/'], { queryParams: { customerUniqueId: params.customerUniqueId, partReleaseId: params.partReleaseId } })
  }

}
