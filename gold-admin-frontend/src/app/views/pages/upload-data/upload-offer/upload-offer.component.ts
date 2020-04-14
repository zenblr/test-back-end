import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { UploadBannerService } from '../../../../core/upload-data/upload-banner/services/upload-banner.service';

@Component({
  selector: 'kt-upload-offer',
  templateUrl: './upload-offer.component.html',
  styleUrls: ['./upload-offer.component.scss']
})
export class UploadOfferComponent implements OnInit {
  images: any[] = []
  index: number = null
  @ViewChild("file", { static: false }) file;

  constructor(private uploadBannerService: UploadBannerService,
    private ref: ChangeDetectorRef) { }

  ngOnInit() {
  }


  uploadImages(event) {

    var reader = new FileReader()
    console.log(this.images)
    if (event.target.files.length == 0) {
      this.index == null
    } else {
      reader.readAsDataURL(event.target.files[0]);
      var fd = new FormData()
      fd.append('avatar', event.target.files[0])
      this.uploadBannerService.uploadFile(fd).subscribe(
        res => {
          console.log(reader.result);
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

  upload(idx) {
    this.file.nativeElement.click()
    this.index = idx;
  }
}
