import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UploadDesignService } from '../../../../../core/emi-management/upload-design';

@Component({
  selector: 'kt-upload-design',
  templateUrl: './upload-design.component.html',
  styleUrls: ['./upload-design.component.scss']
})
export class UploadDesignComponent implements OnInit {
  // public designs: FormGroup;
  // public file: any;
  // public arrayBuffer: any;
  // public exceljsondata: any;
  public files: Array<any> = [];
  // remark = '';
  public frmData;
  // excelFormat: Array<any> = [];
  public greaterThanFiftyImageError: boolean = false;
  public greaterThanFiftyImageButton: boolean = true;

  constructor(public fb: FormBuilder, public uploadDesignService: UploadDesignService, public toast: ToastrService, public ref: ChangeDetectorRef) { }

  ngOnInit() {
    // this.formdata();
  }

  // formdata() {
  //   this.designs = this.fb.group({
  //     design_input: ["", Validators.required]
  //   });
  // }

  getFileDetails(e) {
    this.files = [];
    if (e.target.files.length > 50) {
      this.greaterThanFiftyImageError = true;
      this.greaterThanFiftyImageButton = true;
    }
    else {
      this.greaterThanFiftyImageError = false;
      this.greaterThanFiftyImageButton = false;
    }
    if (e.target.files.length) {
      for (const file of e.target.files) {
        this.files.push(file);
      }
    }
  }

  uploadFiles() {
    if (!this.files.length) {
      this.toast.error('Please first choose files to upload');
      return;
    }

    this.frmData = new FormData();
    for (const file of this.files) {
      this.frmData.append("avatar", file);
    }
    // for (var i = 0; i < this.files.length; i++) {
    //   this.frmData.append("avatar", this.files[i]);
    //   if (i == 0) {
    //     this.frmData.append("remark", this.remark);
    //   }
    // }
    this.uploadDesignService.uploadMultipleImages(this.frmData).subscribe(
      res => {
        let errorLen = res.report.error.length;
        let succLen = res.report.success.length;

        if (succLen >= errorLen) {
          this.toast.success('Image Uploaded Successfully');
        } else {
          this.toast.error('All files not uploaded check image naming and upload again');
        }

        // let length = Math.max(errorLen, succLen)
        // for (let i = 0; i < length; i++) {
        //   if (succLen > i)
        //     this.excelFormat[i].success = res.report.success[i]
        //   if (errorLen > i)
        //     this.excelFormat[i].error = res.report.error[i]
        // }

        this.files = [];
        this.ref.detectChanges();
      },
      err => {
        this.files = [];
        this.toast.error(err['error']['message']);
        this.ref.detectChanges();
      }
    );
  }

  cancelFiles() {
    this.files = [];
  }

  // isControlHasError(controlName: string, validationType: string): boolean {
  //   const control = this.designs.controls[controlName];
  //   if (!control) {
  //     return false;
  //   }
  //   const result = control.hasError(validationType) && (control.dirty || control.touched);
  //   return result;
  // }
}