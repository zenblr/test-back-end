import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { UploadLenderBannerService } from '../../../../core/upload-data';
import { map, catchError, finalize } from 'rxjs/operators';
import { ToastrComponent } from '../../../../views/partials/components';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'kt-upload-lender-banner',
  templateUrl: './upload-lender-banner.component.html',
  styleUrls: ['./upload-lender-banner.component.scss']
})
export class UploadLenderBannerComponent implements OnInit {
  images: any[] = []
  index: number = null
  @ViewChild("file", { static: false }) file;
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;



  constructor(
    private uploadLenderBannerService: UploadLenderBannerService,
    private ref: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.getData()
  }

  getData() {
    this.uploadLenderBannerService.getLenderBanners().pipe(
      map(res => {
        if (res.images.length > 0) {
          Array.prototype.push.apply(this.images, res.images)
          this.ref.detectChanges();
        }
        console.log(this.images)
      })).subscribe()
  }

  uploadImages(event) {

    if (event.target.files.length == 0) {
      this.index == null
    } else {
      var reader = new FileReader()
      reader.readAsDataURL(event.target.files[0]);
      var fd = new FormData()
      fd.append('avatar', event.target.files[0])
      this.uploadLenderBannerService.uploadFile(fd).pipe(map(res => {
        if (this.index != null) {
          this.images.splice(this.index, 1, res.uploadFile.URL)
          this.index = null;
        } else {
          this.images.push(res.uploadFile.URL)
        }
        this.ref.detectChanges();
      }),
        catchError(err => {
          this.toastr.errorToastr('Please try Again');
          throw err
        }), finalize(() => {
          this.spinner.hide();
        })).subscribe()
    }
  }

  uploadLenderBanners() {

    this.spinner.show()
    this.uploadLenderBannerService.uploadLenderBanners(this.images).pipe(
      (map(res => {
        this.toastr.successToastr('Uploaded Sucessfully');
      })),
      catchError(err => {
        this.toastr.errorToastr('Please try Again');
        throw err
      }),
      finalize(() => {
        this.spinner.hide()
      })
    ).subscribe();

  }

  delete(index: number) {
    this.images.splice(index, 1)
    this.ref.detectChanges();
  }

  upload(idx) {
    this.file.nativeElement.click()
    this.index = idx;
  }
}

