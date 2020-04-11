import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UploadBannerService } from '../../../../core/upload-data/upload-banner/services/upload-banner.service';

@Component({
  selector: 'kt-upload-offer',
  templateUrl: './upload-offer.component.html',
  styleUrls: ['./upload-offer.component.scss']
})
export class UploadOfferComponent implements OnInit {
  images: any[] = []

  constructor(private uploadBannerService: UploadBannerService,
    private ref: ChangeDetectorRef) { }

  ngOnInit() {
  }

  addImages() {
    var data =
    {
      value: '',
      isRemoved: false,
      isEditable: false,
      showImg: false,
    }
    this.images.push(data)
    console.log(this.images)
  }

  uploadImages(event, index: number) {
    var reader = new FileReader()
    this.images[index].value = event.target.files[0]
    this.images[index].isEditable = true;
    this.images[index].isRemoved = true;
    console.log(this.images[index])
    reader.readAsDataURL(event.target.files[0]);
    var fd = new FormData()
    fd.append('avatar', this.images[index].value)
    this.uploadBannerService.uploadFile(fd).subscribe(
      res => {
        console.log(reader.result);
        this.images[index].value = res.uploadFile.URL
        this.images[index].showImg = true;
        this.ref.detectChanges()
      })
  }
}
