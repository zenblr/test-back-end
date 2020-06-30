import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
// Services
import { UploadBannerService } from '../../../../../core/upload-data/upload-banner/services/upload-banner.service';
import { map, catchError, finalize } from 'rxjs/operators';
import { ToastrComponent } from '../../../../partials/components';
import { SharedService } from '../../../../../core/shared/services/shared.service';


@Component({
  selector: 'kt-upload-banner',
  templateUrl: './upload-banner.component.html',
})
export class UploadBannerComponent implements OnInit {
  images: any[] = []
  imgId: any[] = []

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
        if (res.bannerImage.length > 0) {
          res.bannerImage.forEach(element => {
            this.images.push(element.bannerImage.URL)
            this.imgId.push(element.bannerImage.id)
          });
        }
      })).subscribe()
  }



  uploadBanners() {
    this.UploadBannerService.uploadBanners(this.imgId).pipe(
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

