import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { UploadOfferService } from '../../../../core/upload-data';
import { map } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';

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
  goldRate = new FormControl(null, Validators.required);


  constructor(private uploadOfferService: UploadOfferService,
    private ref: ChangeDetectorRef) { }

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
      var reader = new FileReader()
      reader.readAsDataURL(event.target.files[0]);
      var fd = new FormData()
      fd.append('avatar', event.target.files[0])
      this.uploadOfferService.uploadFile(fd).subscribe(
        res => {
          if (this.index != null) {
            this.images.splice(this.index, 1, res.uploadFile.URL)
            this.index = null;
          } else {
            this.images.push(res.uploadFile.URL)
          }
          console.log(this.images)
          this.ref.detectChanges();
        })
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
    this.viewLoading = true;
    this.uploadOfferService.uploadOffers(Number(this.goldRate.value), this.images).pipe(
      map((res => {
        res
      }))
    ).subscribe();
  }

  upload(idx) {
    this.file.nativeElement.click()
    this.index = idx;
  }
}
