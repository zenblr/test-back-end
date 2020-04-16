import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
// Services
import { UploadBannerService } from '../../../../core/upload-data/upload-banner/services/upload-banner.service';
import { map, catchError, finalize } from 'rxjs/operators';
import { ToastrComponent } from '../../../../views/partials/components';
import { SharedService } from '../../../../core/shared/services/shared.service';


@Component({
  selector: 'kt-upload-banner',
  templateUrl: './upload-banner.component.html',
})
export class UploadBannerComponent implements OnInit {
  images: any[] = []
  
  viewLoading = false;
  clearImage: boolean;
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;

  constructor(
    private UploadBannerService: UploadBannerService,
    private ref: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.getData()
  }

  getData() {
    this.UploadBannerService.getBanners().pipe(
      map(res => {
        if (res.images.length > 0) {
          Array.prototype.push.apply(this.images, res.images)
          this.ref.detectChanges();
        }
      }),
      finalize(() => {
      })).subscribe()
  }

  

  uploadBanners() {
    this.UploadBannerService.uploadBanners(this.images).pipe(
      (map(res => {
        this.toastr.successToastr('Uploaded Sucessfully');
      })),
      catchError(err => {
        this.toastr.errorToastr('Please try Again');
        throw err
      }),
      finalize(() => {
      })
    ).subscribe();

  }
 
}

