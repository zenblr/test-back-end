import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { UploadLenderBannerService } from '../../../../../core/upload-data';
import { map, catchError, finalize } from 'rxjs/operators';
import { ToastrComponent } from '../../../../partials/components';
import { SharedService } from '../../../../../core/shared/services/shared.service';


@Component({
  selector: 'kt-upload-lender-banner',
  templateUrl: './upload-lender-banner.component.html',
})
export class UploadLenderBannerComponent implements OnInit {
  images: any[] = []
  imgId: any[] = []
  index: number = null
  @ViewChild("file", { static: false }) file;
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;



  constructor(
    private uploadLenderBannerService: UploadLenderBannerService,
    private ref: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.getData()
  }

  getData() {
    this.uploadLenderBannerService.getLenderBanners().pipe(
      map(res => {
        // if (res.lenderBannerImages.length > 0) {
        //   res.lenderBannerImages.forEach(element => {
        //     this.images.push(element.lenderBannerImages.URL)
        //     this.imgId.push(element.lenderBannerImages.id)
        //   });
        // }
        if (res) {
          this.images = res.lenderBannerImages
          this.imgId = res.images
        }
      })).subscribe()
  }



  uploadLenderBanners() {

    this.uploadLenderBannerService.uploadLenderBanners(this.imgId).pipe(
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

