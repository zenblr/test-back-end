import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { map, finalize, catchError } from 'rxjs/operators';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { ProcessNoteService } from '../../../../../core/upload-data/process-note/services/process-note.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material';
import { ImagePreviewDialogComponent } from '../../../../partials/components/image-preview-dialog/image-preview-dialog.component';
import { PdfViewerComponent } from '../../../../partials/components/pdf-viewer/pdf-viewer.component';
import { UploadBannerService } from '../../../../../core/upload-data';

@Component({
  selector: 'kt-process-note',
  templateUrl: './process-note.component.html',
  styleUrls: ['./process-note.component.scss']
})
export class ProcessNoteComponent implements OnInit {

  @ViewChild("file", { static: false }) file;
  index: number = null;
  images = [];
  editBanner = true;
  deleteBanner = true;
  add = true;

  constructor(
    private sharedService: SharedService,
    private layoutUtilsService: LayoutUtilsService,
    private ref: ChangeDetectorRef,
    private processNoteService: ProcessNoteService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private uploadBannerService: UploadBannerService
  ) { }

  ngOnInit() {
    this.getData()
  }

  getData() {
    // this.uploadBannerService.getBanners().pipe(
    this.processNoteService.getProcessNote().pipe(
      map(res => {
        if (res) {
          res.data.ProcessNotePdf.forEach((element, index) => {
            this.images.push({ path: res.data.pdf[index], URL: element })
          });
          console.log(this.images)
        }
      })).subscribe()
  }

  edit(index: number) {
    this.file.nativeElement.click()
    this.index = index;
  }

  removeImage(index) {

    const _title = 'Delete Process Note';
    const _description = 'Are you sure to permanently delete this document?';
    const _waitDesciption = 'Document is deleting...';
    const _deleteMessage = 'Document has been deleted';

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.images.splice(index, 1);
        this.ref.detectChanges();
      }
    });
  }

  previewImage(value) {

    const img = value
    let images = []
    images = this.getURLArray()

    images = images.filter(e => {
      let ext = this.sharedService.getExtension(e)
      return ext !== 'pdf' && e != ''
    })
    const index = images.indexOf(img)

    const ext = this.sharedService.getExtension(img)
    if (ext == 'pdf') {
      this.dialog.open(PdfViewerComponent, {
        data: {
          pdfSrc: img,
          page: 1,
          showAll: true
        },
        width: "80%"
      })
    } else {
      this.dialog.open(ImagePreviewDialogComponent, {
        data: {
          images: images,
          index: index,
        },
        width: "auto"
      })
    }
  }

  uploadImages(event) {
    var file = event.target.files[0];

    if (this.sharedService.fileValidator(event, 'pdf')) {
      const params = {
        reason: 'processNote',
      }
      this.sharedService.uploadFile(file, params).pipe(
        map(res => {
          this.images.push({ path: res.uploadFile.path, URL: res.uploadFile.URL })
        }),
        finalize(() => {
          if (this.file && this.file.nativeElement.value) this.file.nativeElement.value = ''
          event.target.value = ''
        }))
        .subscribe()
    } else {
      event.target.value = ''
    }
  }

  uploadBanners() {
    this.processNoteService.uploadProcessNote(this.getPathArray()).pipe(
      (map(res => {
        this.toastr.success('Uploaded Sucessfully');
      })),
      finalize(() => { })
    ).subscribe();
  }

  getPathArray(type?: string) {
    const pathArray = this.images.map(e => e.path)
    return pathArray
  }

  getURLArray(type?: string) {
    const urlArray = this.images.map(e => e.URL)
    return urlArray
  }

  isPdf(image: string): boolean {
    const ext = this.sharedService.getExtension(image)
    const isPdf = ext == 'pdf' ? true : false
    return isPdf
  }

}
