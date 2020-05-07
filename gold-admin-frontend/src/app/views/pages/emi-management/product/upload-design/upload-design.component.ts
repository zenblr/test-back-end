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
  public designs: FormGroup;
  public file: any;
  public arrayBuffer: any;
  public exceljsondata: any;
  public myFiles: Array<any> = [];
  remark = '';
  public frmData;
  public spinnerValue: boolean = false;
  excelFormat: Array<any> = [];
  public greaterThanFiftyImageError: boolean = false;
  public greaterThanFiftyImageButton: boolean = true;

  constructor(public fb: FormBuilder, public uploadDesignService: UploadDesignService, public toast: ToastrService, public ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.formdata();
  }

  formdata() {
    this.designs = this.fb.group({
      design_input: ["", Validators.required]
    });
  }

  getFileDetails(e) {
    this.myFiles = [];
    for (var i = 0; i < e.target.files.length; i++) {
      this.myFiles.push(e.target.files[i]);

    }
    if (this.myFiles.length > 50) {
      this.greaterThanFiftyImageError = true;
      this.greaterThanFiftyImageButton = true;
    }
    else {
      this.greaterThanFiftyImageError = false;
      this.greaterThanFiftyImageButton = false;
    }
  }

  uploadFiles() {
    this.spinnerValue = true;
    this.frmData = new FormData();
    for (var i = 0; i < this.myFiles.length; i++) {
      this.frmData.append("avatar", this.myFiles[i]);
      if (i == 0) {
        this.frmData.append("remark", this.remark);
      }
    }
    this.uploadDesignService.uploadMultipleImages(this.frmData).subscribe(
      res => {
        this.excelFormat = []
        let errorLen = res.report.error.length;
        let succLen = res.report.success.length;
        let length = Math.max(errorLen, succLen)
        for (let i = 0; i < length; i++) {
          let params = {
            success: '',
            error: ''
          }
          this.excelFormat.push(params)
        }
        for (let i = 0; i < length; i++) {
          if (succLen > i)
            this.excelFormat[i].success = res.report.success[i]
          if (errorLen > i)
            this.excelFormat[i].error = res.report.error[i]
        }
        // this.exportAsXLSX();
        this.spinnerValue = false;

        this.toast.success('Success', 'Designs Uploaded Successfully', {
          timeOut: 3000
        });
        this.ref.detectChanges();
      },
      err => {
        this.spinnerValue = false;
        this.ref.detectChanges();
        this.toast.error('Sorry', err['error']['message'], {
          timeOut: 3000
        });
      }
    );
  }

  isControlHasError(controlName: string, validationType: string): boolean {
    const control = this.designs.controls[controlName];
    if (!control) {
      return false;
    }
    const result = control.hasError(validationType) && (control.dirty || control.touched);
    return result;
  }
}