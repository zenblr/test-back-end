import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { UploadLenderBannerService } from '../../../../core/upload-data';
import { map } from 'rxjs/operators';

@Component({
  selector: 'kt-upload-lender-banner',
  templateUrl: './upload-lender-banner.component.html',
  styleUrls: ['./upload-lender-banner.component.scss']
})
export class UploadLenderBannerComponent implements OnInit {
  images: any[] = []
  index: number = null
  @ViewChild("file", { static: false }) file;


  constructor(private uploadLenderBannerService: UploadLenderBannerService,
    private ref: ChangeDetectorRef) { }

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
      this.uploadLenderBannerService.uploadFile(fd).subscribe(
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

    this.uploadLenderBannerService.uploadLenderBanners(this.images).pipe(
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

