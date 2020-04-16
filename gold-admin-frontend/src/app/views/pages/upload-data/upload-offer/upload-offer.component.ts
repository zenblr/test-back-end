import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { UploadOfferService } from '../../../../core/upload-data';
import { map, catchError, finalize } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';
import { ToastrComponent } from '../../../../views/partials/components';
import { NgxSpinnerService } from 'ngx-spinner';
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
    private sharedService: SharedService,
    private ref: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.getData()
  }

  getData() {
    this.uploadOfferService.getOffers().pipe(
      map(res => {
        if (res.images.length > 0) {
          Array.prototype.push.apply(this.images, res.images)
          this.goldRate.patchValue(res.goldRate)
          this.ref.detectChanges();
        }
        console.log(this.images)
      })).subscribe()
  }

  uploadImages(event) {

    if (event.target.files.length == 0) {
      this.index == null
    } else {
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
          this.file.nativeElement.value = ''
        })).subscribe()
    }
  }

  delete(index: number) {
    this.images.splice(index, 1)
    this.ref.detectChanges();
  }

  save() {
    if (this.goldRate.invalid) {
      this.goldRate.markAsTouched()
      return
    }
    this.spinner.show()
    this.uploadOfferService.uploadOffers(Number(this.goldRate.value), this.images).pipe(
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

  upload(idx) {
    this.file.nativeElement.click()
    this.index = idx;
  }
}
