import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
// Services
import { UploadBannerService } from '../../../../core/upload-data/upload-banner/services/upload-banner.service';
import { map, catchError, finalize } from 'rxjs/operators';
import { ToastrComponent } from '../../../../views/partials/components';
import { NgxSpinnerService } from "ngx-spinner";
import { SharedService } from '../../../../core/shared/services/shared.service';


@Component({
  selector: 'kt-upload-banner',
  templateUrl: './upload-banner.component.html',
  styleUrls: ['./upload-banner.component.scss']
})
export class UploadBannerComponent implements OnInit {
  images: any[] = []
  index: number = null;
  viewLoading = false;
  @ViewChild("file", { static: false }) file;
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;



  constructor(
    private sharedService: SharedService,
    private UploadBannerService: UploadBannerService,
    private ref: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.getData()
  }

  getData() {
    this.spinner.show();
    this.UploadBannerService.getBanners().pipe(
      map(res => {
        if (res.images.length > 0) {
          Array.prototype.push.apply(this.images, res.images)
          this.ref.detectChanges();
        }
      }),
      finalize(() => {
        this.spinner.hide();
      })).subscribe()
  }

  uploadImages(event) {

    if (event.target.files.length == 0) {
      this.index == null
    } else {
      this.spinner.show()
      this.sharedService.uploadFile(event.target.files[0]).pipe(map(res => {
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
          this.file.nativeElement.value = '';
        })).subscribe()
    }
  }

  uploadBanners() {
    this.spinner.show()
    this.UploadBannerService.uploadBanners(this.images).pipe(
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

