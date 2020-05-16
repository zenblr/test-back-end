import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UploadDesignService } from '../../../../../core/emi-management/product';

@Component({
  selector: 'kt-upload-design',
  templateUrl: './upload-design.component.html',
  styleUrls: ['./upload-design.component.scss']
})
export class UploadDesignComponent implements OnInit {
  @ViewChild("file", { static: false }) file;
  files = [];
  filesPreview = [];
  formData: any;
  improperCount = 0;
  greaterThanFiftyImageError = false;
  greaterThanFiftyImageButton = true;

  constructor(
    private uploadDesignService: UploadDesignService,
    private toast: ToastrService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() { }

  getFileDetails(e) {
    this.files = [];
    if (e.target.files.length > 50) {
      this.greaterThanFiftyImageError = true;
      this.greaterThanFiftyImageButton = true;
    } else {
      this.greaterThanFiftyImageError = false;
      this.greaterThanFiftyImageButton = false;
    }
    if (e.target.files.length) {
      for (const file of e.target.files) {
        this.files.push(file);
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (_event) => {
          setTimeout(() => {
            this.filesPreview.push(reader.result);
            this.ref.detectChanges();
          })
        }
      }
      console.log(this.files);
    }
  }

  uploadImages(event) {
    if (event.target.files.length === 0) {
      return;
    }
    this.files = [];
    this.improperCount = 0;
    for (const file of event.target.files) {
      const reader = new FileReader();
      const img = new Image();
      img.src = window.URL.createObjectURL(file);
      reader.readAsDataURL(file);
      reader.onload = (_event) => {
        setTimeout(() => {
          const width = img.naturalWidth;
          const height = img.naturalHeight;
          window.URL.revokeObjectURL(img.src);
          if ((width !== 1500 || height !== 1500) || (file.size > 1000000)) {
            console.log(width, height, file.size);
            this.improperCount++;
          } else {
            this.files.push(file);
          }
          this.ref.detectChanges();
        }, 2000);
      }
    }
  }

  uploadFiles() {
    if (!this.files.length) {
      this.toast.error('Please first choose files to upload');
      return;
    }
    this.formData = new FormData();
    for (const file of this.files) {
      this.formData.append("avatar", file);
    }
    this.uploadDesignService.uploadMultipleImages(this.formData).subscribe(
      res => {
        let errorLen = res.report.error.length;
        let succLen = res.report.success.length;

        if (succLen >= errorLen) {
          this.toast.success('Image Uploaded Successfully');
        } else {
          this.toast.error('All files not uploaded check image naming and upload again');
        }
        this.files = [];
        this.improperCount = 0;
        this.file.nativeElement.value = '';
        this.ref.detectChanges();
      },
      err => {
        this.files = [];
        this.improperCount = 0;
        this.file.nativeElement.value = '';
        this.toast.error(err['error']['message']);
        this.ref.detectChanges();
      }
    );
  }

  cancelFiles() {
    this.files = [];
    this.improperCount = 0;
    this.file.nativeElement.value = '';
  }
}