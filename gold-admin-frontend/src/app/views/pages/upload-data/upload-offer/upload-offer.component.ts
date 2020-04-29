import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { UploadOfferService } from '../../../../core/upload-data';
import { map, catchError, finalize } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';
import { ToastrComponent } from '../../../../views/partials/components';
import { SharedService } from '../../../../core/shared/services/shared.service';

@Component({
  selector: 'kt-upload-offer',
  templateUrl: './upload-offer.component.html',
  styleUrls: ['./upload-offer.component.scss']
})
export class UploadOfferComponent implements OnInit {
  images: any[] = []
  index: number = null
  viewLoading: boolean = false;
  @ViewChild("file", { static: false }) file;
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;

  goldRate = new FormControl(null, Validators.required);


  constructor(
    private uploadOfferService: UploadOfferService,
    private ref: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.getData();
    this.getGoldRate();
  }

  getData() {
    this.uploadOfferService.getOffers().pipe(
      map(res => {
        // this.goldRate.patchValue(res.goldRate)
        // this.uploadOfferService.goldRate.next(res.goldRate);
        if (res.images.length > 0) {
          Array.prototype.push.apply(this.images, res.images)
        }
        this.ref.detectChanges();
      })).subscribe()
  }

  getGoldRate() {
    this.uploadOfferService.getGoldRate().pipe(
      map(res => {
        this.goldRate.patchValue(res.goldRate)
        this.uploadOfferService.goldRate.next(res.goldRate);
      })).subscribe()
  }

  updateGoldRate() {
    if (this.goldRate.invalid) {
      this.goldRate.markAsTouched()
      return
    }

    this.uploadOfferService.updateGoldRate({ goldRate: this.goldRate.value }).pipe(
      map(res => {
        if (res) {
          this.toastr.successToastr('Gold Rate Updated Sucessfully');
          this.uploadOfferService.goldRate.next(this.goldRate.value);
          this.getGoldRate();
        }
      }),
      // catchError(err => {
      // this.toastr.errorToastr('Please try Again');
      //   throw err
      // }),
      finalize(() => {
      })
    ).subscribe();
  }

  save() {

    this.uploadOfferService.uploadOffers(this.images).pipe(
      (map(res => {
        this.toastr.successToastr('Uploaded Sucessfully');
        // this.uploadOfferService.goldRate.next(this.goldRate.value);
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
