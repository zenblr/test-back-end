import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
// Services
import { UploadBannerService } from '../../../../core/upload-data/upload-banner/services/upload-banner.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'kt-upload-banner',
  templateUrl: './upload-banner.component.html',
  styleUrls: ['./upload-banner.component.scss']
})
export class UploadBannerComponent implements OnInit {
  bannerForm: FormGroup;
  imageUrl1: any = '/assets/media/bg/sc-home1-bg.png';
  imageUrl2: any = '/assets/media/bg/sc-home1-bg.png';
  imageUrl3: any = '/assets/media/bg/sc-home1-bg.png';

  public categoryData: any;
  public imageFile: any;
  public imageFile2: any;
  public imageFile3: any;
  // public imageFile4: any;
  public imagePath: any;
  public urlCheck: boolean = true;
  public url: any;
  public urlCheck2: boolean = true;
  public url2: any;
  public urlCheck3: boolean = true;
  public url3: any;
  // public urlCheck4: boolean = true;
  // public url4: any;
  public categoryName: Array<any> = [];
  public images: Array<any> = ['', '', ''];
  public indexex: Array<any> = [];
  public categoryIdd: any;
  // public images: Array<any>;
  public enableBtn: boolean = true;
  public img1Error: boolean = false;
  public img2Error: boolean = false;
  public img3Error: boolean = false;
  public widthHeightError: boolean = false;
  public widthHeightError2: boolean = false;
  public widthHeightError3: boolean = false;
  public imagePath1;
  public imagePath2;
  public imagePath3;
  public enableButton;
  public fd: any;

  constructor(
    private fb: FormBuilder, private ref: ChangeDetectorRef,
    private uploadBannerService: UploadBannerService, private toast: ToastrService) { }

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.bannerForm = this.fb.group({
      //   desc1: [],
      //   desc2: [],
      //   desc3: [],
      file1: [],
      file2: [],
      file3: []
    });
  }

  uploadFile(event, num) {
    console.log(event, num);
    let reader = new FileReader(); // HTML5 FileReader API
    let file = <File>event.target.files[0];
    const fd = new FormData();
    fd.append('image', file);
    console.log(fd);
    if (event.target.files && event.target.files[0]) {
      reader.readAsDataURL(file);

      // When file uploads set it to file formcontrol
      reader.onload = () => {
        this.imageUrl1 = reader.result;
        this.bannerForm.patchValue({
          file1: reader.result
        });
        console.log(this.bannerForm.value);

        const fd = new FormData();
        fd.append('image', file, file.name);
        console.log(fd);

        // this.uploadBannerService.uploadBanner(fd).subscribe();

        // this.editFile = false;
        // this.removeUpload = true;
      }
      // ChangeDetectorRef since file is loading outside the zone
      this.ref.markForCheck();
    }
  }

  singleProductImageChangenew(event, num) {
    debugger
    if (num == 1) {
      if (event.target.files.length && event.target.files[0]) {
        let imgSize = event.target.files[0].size;
        if (imgSize > 150000) {
          this.widthHeightError = false;
          this.img1Error = true;
        }
        else {
          this.img1Error = false;
          this.imageFile = <File>event.target.files[0];
          var reader = new FileReader();
          const img = new Image();
          img.src = window.URL.createObjectURL(this.imageFile);
          this.imagePath1 = event.target.files;
          reader.readAsDataURL(event.target.files[0]);
          reader.onload = (_event) => {
            setTimeout(() => {
              const width = img.naturalWidth;
              const height = img.naturalHeight;
              window.URL.revokeObjectURL(img.src);
              if (width > 600 || height > 600) {
                this.widthHeightError = true;
                this.enableButton = false;
              } else {
                this.url = reader.result;

                const fd = new FormData();
                fd.append('avatar', this.imageFile, this.imageFile.name);
                const data = fd.getAll('avatar');
                console.log(data);
                this.uploadBannerService.uploadFile(fd).subscribe(
                  res => {
                    console.log(res);
                    this.images[num - 1] = '';
                    this.enableBtn = false;
                    this.widthHeightError = false;
                    this.ref.detectChanges();
                    this.images[num - 1] = res['uploadFile']['URL'];
                    // this.spinnerValue = true;
                    this.uploadBannerService.uploadBanners(this.images).subscribe(
                      res => {
                        // this.spinnerValue = false;
                        this.ref.detectChanges();
                        this.toast.success('Success', 'Banners Uploaded Successfully', {
                          timeOut: 3000
                        });
                        this.getBanners();
                        this.ref.detectChanges();
                      },
                      err => {
                        // this.spinnerValue = false;
                        this.ref.detectChanges();
                        this.widthHeightError = false;
                        this.ref.detectChanges();
                        this.toast.error('Sorry', err['error']['message'], {
                          timeOut: 3000
                        });
                      }
                    )
                    this.ref.detectChanges();
                  },
                  err => {
                    // this.spinnerValue = false;
                    this.ref.detectChanges();
                    this.enableBtn = true;
                  }
                )
              }
              this.ref.detectChanges();
            }, 2000);
          }
        }
      }
    } else if (num == 2) {
      if (event.target.files.length && event.target.files[0]) {
        let imgSize = event.target.files[0].size;
        if (imgSize > 150000) {
          this.widthHeightError2 = false;
          this.img2Error = true;
        } else {
          this.img2Error = false;
          this.imageFile2 = <File>event.target.files[0];
          const img = new Image();
          img.src = window.URL.createObjectURL(this.imageFile2);
          var reader = new FileReader();
          this.imagePath2 = event.target.files;
          reader.readAsDataURL(event.target.files[0]);
          reader.onload = (_event) => {
            setTimeout(() => {
              const width = img.naturalWidth;
              const height = img.naturalHeight;
              window.URL.revokeObjectURL(img.src);
              if (width > 600 || height > 600) {
                this.widthHeightError2 = true;
                this.enableButton = false;
              } else {
                this.url2 = reader.result;
                this.widthHeightError2 = false;
                this.ref.detectChanges();
                const fd = new FormData();
                fd.append('avatar', this.imageFile2, this.imageFile2.name);
                this.uploadBannerService.uploadFile(fd).subscribe(
                  res => {
                    this.images[num - 1] = '';
                    this.enableBtn = false;
                    this.ref.detectChanges();
                    this.images[num - 1] = res['uploadFile']['URL'];
                    // this.spinnerValue = true;
                    this.uploadBannerService.uploadBanners(this.images).subscribe(
                      res => {
                        // this.spinnerValue = false;
                        this.ref.detectChanges();
                        this.toast.success('success', 'Banners Uploaded Successfully', {
                          timeOut: 3000
                        });
                        this.getBanners();
                        this.ref.detectChanges();
                      },
                      err => {
                        // this.spinnerValue = false;
                        this.ref.detectChanges();
                        this.toast.error('Sorry', err['error']['message'], {
                          timeOut: 3000
                        });
                      }
                    )
                    this.ref.detectChanges();
                  },
                  err => {
                    // this.spinnerValue = false;
                    this.ref.detectChanges();
                    this.enableBtn = true;
                  }
                )
              }
              this.ref.detectChanges();
            }, 2000);
          }
        }
      }
    } else {
      // debugger
      if (event.target.files.length && event.target.files[0]) {
        let imgSize = event.target.files[0].size;
        if (imgSize > 150000) {
          this.widthHeightError3 = false;
          this.img3Error = true;
        } else {
          this.img3Error = false;
          this.imageFile3 = <File>event.target.files[0];
          var reader = new FileReader();
          const img = new Image();
          img.src = window.URL.createObjectURL(this.imageFile3);
          this.imagePath3 = event.target.files;
          reader.readAsDataURL(event.target.files[0]);
          reader.onload = (_event) => {
            setTimeout(() => {
              const width = img.naturalWidth;
              const height = img.naturalHeight;
              window.URL.revokeObjectURL(img.src);
              if (width > 600 || height > 600) {
                this.widthHeightError3 = true;
                this.enableButton = false;
              } else {
                this.url3 = reader.result;
                this.widthHeightError3 = false;
                this.ref.detectChanges();
                const fd = new FormData();
                fd.append('avatar', this.imageFile3, this.imageFile3.name);
                this.uploadBannerService.uploadFile(fd).subscribe(
                  res => {
                    this.images[num - 1] = '';
                    this.enableBtn = false;
                    this.ref.detectChanges();
                    this.images[num - 1] = res['uploadFile']['URL'];
                    // this.spinnerValue = true;
                    this.uploadBannerService.uploadBanners(this.images).subscribe(
                      res => {
                        // this.spinnerValue = false;
                        this.ref.detectChanges();
                        this.toast.success('success', 'Banners Uploaded Successfully', {
                          timeOut: 3000
                        });
                        this.getBanners();
                        this.ref.detectChanges();
                      },
                      err => {
                        // this.spinnerValue = false;
                        this.ref.detectChanges();
                        this.toast.error('Sorry', err['error']['message'], {
                          timeOut: 3000
                        });
                      }
                    )
                    this.ref.detectChanges();
                  },
                  err => {
                    this.enableBtn = true;
                    this.ref.detectChanges();
                  }
                )
              }
              this.ref.detectChanges();
            }, 2000);
            this.ref.detectChanges();
          }
        }
      }
    }
  }

  getBanners() {
    this.uploadBannerService.getBanners().subscribe(
      res => {
        // this.spinnerValue = false;
        this.ref.detectChanges();
        this.images = res['images'];
        this.ref.detectChanges();
        if (this.images['0']) {
          this.url = this.images['0'];
          this.urlCheck = false;
          this.ref.detectChanges();
        }
        if (this.images['1']) {
          this.url2 = this.images['1'];
          this.urlCheck2 = false;
          this.ref.detectChanges();

          // this.detect();
        }
        if (this.images['2']) {
          this.url3 = this.images['2'];
          this.urlCheck3 = false;
          this.ref.detectChanges();

          // this.detect();
        }
        // this.spinnerValue = false;
        this.ref.detectChanges();
      },
      err => {
        // this.spinnerValue = false;
        this.ref.detectChanges();
        this.url = '';
        this.url2 = '';
        this.url3 = '';
        this.urlCheck = true;
        this.urlCheck2 = true;
        this.urlCheck3 = true;
        this.images = [];
        this.ref.detectChanges();
      }
    );
  }

  deleteBanner(num) {
    if (num == 1) {
      // const dialogRef = this.dialog.open(DeleteEntityDialogComponent, {
      //   data: { title: "UploadBannersComponent", action: "Delete banner", num },
      //   width: "50vw"
      // }); dialogRef.afterClosed().subscribe(res => {
      //   let status = res;
      //   this.ref.detectChanges();
      //   if (status == "delete") {
      this.url = '';
      this.images[num - 1] = '';
      this.urlCheck = true;
      // this.spinnerValue = true;
      this.uploadBannerService.uploadBanners(this.images).subscribe(
        res => {
          // this.spinnerValue = false;
          this.ref.detectChanges();
          this.toast.success('success', 'Banners Deleted Successfully', {
            timeOut: 3000
          });
          this.getBanners();
          this.ref.detectChanges();
        },
        err => {
          // this.spinnerValue = false;
          this.ref.detectChanges();
          this.toast.error('Sorry', err['error']['message'], {
            timeOut: 3000
          });
        }
      )
      //   }
      // });
    }
    else if (num == 2) {

      // const dialogRef = this.dialog.open(DeleteEntityDialogComponent, {
      //   data: { title: "UploadBannersComponent", action: "Delete banner", num },
      //   width: "50vw"
      // }); dialogRef.afterClosed().subscribe(res => {
      //   let status = res;
      //   this.ref.detectChanges();
      //   if (status == "delete") {
      this.url2 = '';
      this.images[num - 1] = '';
      this.urlCheck2 = true;
      // this.spinnerValue = true;
      this.ref.detectChanges();
      this.uploadBannerService.uploadBanners(this.images).subscribe(
        res => {
          // this.spinnerValue = false;
          this.ref.detectChanges();
          this.toast.success('success', 'Banners Deleted Successfully', {
            timeOut: 3000
          });
          this.getBanners();
          this.ref.detectChanges();
        },
        err => {
          // this.spinnerValue = false;
          this.ref.detectChanges();
          this.toast.error('Sorry', err['error']['message'], {
            timeOut: 3000
          });
        }
      )
      //   }
      // });
    }
    else if (num == 3) {
      // const dialogRef = this.dialog.open(DeleteEntityDialogComponent, {
      //   data: { title: "UploadBannersComponent", action: "Delete banner", num },
      //   width: "50vw"
      // }); 
      // dialogRef.afterClosed().subscribe(res => {
      //   let status = res;
      //   this.ref.detectChanges();
      //   if (status == "delete") {
      this.url3 = '';
      this.images[num - 1] = '';
      this.urlCheck3 = true;
      // this.spinnerValue = true;
      this.uploadBannerService.uploadBanners(this.images).subscribe(
        res => {
          // this.spinnerValue = false;
          this.ref.detectChanges();
          this.toast.success('success', 'Banners Deleted Successfully', {
            timeOut: 3000
          });
          this.getBanners();
          this.ref.detectChanges();
        },
        err => {
          // this.spinnerValue = false;
          this.ref.detectChanges();
          this.toast.error('Sorry', err['error']['message'], {
            timeOut: 3000
          });
        }
      )
      //   }
      // });
    }
  }

}
