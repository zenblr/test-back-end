import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
// Services
import { UploadBannerService } from '../../../../core/upload-data/upload-banner/services/upload-banner.service';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs/operators';
@Component({
  selector: 'kt-upload-banner',
  templateUrl: './upload-banner.component.html',
  styleUrls: ['./upload-banner.component.scss']
})
export class UploadBannerComponent implements OnInit {
  images: any[] = []
  index: number = null
  @ViewChild("file", { static: false }) file;


  constructor(private UploadBannerService: UploadBannerService,
    private ref: ChangeDetectorRef) { }

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
      this.UploadBannerService.uploadFile(fd).subscribe(
        res => {
          
          if (this.index != null) {
            this.images.splice(this.index, 1, res.uploadFile.URL)
            this.index = null;
          } else {
            this.images.push(res.uploadFile.URL)
          }
          this.uploadLenderBanners()
          console.log(this.images)
          this.ref.detectChanges();
        })
    }
  }

  uploadLenderBanners() {

    this.UploadBannerService.uploadBanners(this.images).pipe(
      (map(res => {

      }))
    ).subscribe();

  }

  delete(index: number) {
    this.images.splice(index, 1)
    this.uploadLenderBanners()
    this.ref.detectChanges();
  }

  upload(idx) {
    this.file.nativeElement.click()
    this.index = idx;
  }
}

