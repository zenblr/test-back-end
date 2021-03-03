import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { ToastrComponent } from '../toastr/toastr.component';
import { MatDialog } from '@angular/material'
import { LayoutUtilsService } from '../../../../core/_base/crud';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-uplod-preview-image',
  templateUrl: './uplod-preview-image.component.html',
  styleUrls: ['./uplod-preview-image.component.scss']
})
export class UplodPreviewImageComponent implements OnInit {
  @ViewChild("file", { static: false }) file;
  @Input() image: any;
  @Input() action: any;
  @Input() type: any;
  @Input() index: any;
  @Input() formFieldName: any;
  @Input() fileAcceptType: any;
  @Input() reason: string;
  @Input() validate: boolean;
  @Input() selectedFileForKyc: any;
  @Output() upload = new EventEmitter();
  @Output() remove = new EventEmitter();
  formData: any;
  selectedFile: any;

  @ViewChild(ToastrComponent, { static: false }) toastr: ToastrComponent;

  constructor(
    private ref: ChangeDetectorRef,
    private sharedService: SharedService,
    public dilaog: MatDialog,
    private toast: ToastrService
  ) { }

  ngOnInit() { }

  validateImage(event) {
    if (this.formFieldName == 'panCardFileId') {
      this.getFileInfo(event)
      return
    }
    if (this.validate) {
      const file = event.target.files[0];
      const reader = new FileReader();
      const img = new Image();
      img.src = window.URL.createObjectURL(file);
      reader.readAsDataURL(file);
      reader.onload = (_event) => {
        setTimeout(() => {
          const width = img.naturalWidth;
          const height = img.naturalHeight;
          window.URL.revokeObjectURL(img.src);
          if ((width > 1500 || height > 1500) || (file.size > 200000)) {
            this.toast.error('Please Upload Image of Valid Size');
            this.file.nativeElement.value = '';
          } else {
            this.uploadFile(event);
          }
          this.ref.detectChanges();
        }, 2000);
      }
    } else {
      this.uploadFile(event);
    }
  }

  getFileInfo(event) {
    if (this.sharedService.fileValidator(event)) {
      let data = this.getImageValidationForKarza(event)
      console.log(data)
    } else {
      event.target.value = ''
    }
  }

  getImageValidationForKarza(event) {
    var details = event.target.files
    let ext = this.sharedService.getExtension(details[0].name)
    if (Math.round(details[0].size / 1024) > 4000 && ext != 'pdf') {
      this.toast.error('Maximun size is 4MB')
      event.target.value = ''
      return
    }

    if (ext == 'pdf') {
      if (Math.round(details[0].size / 1024) > 2000) {
        this.toast.error('Maximun size is 2MB')
      } else {
        this.uploadFile(event)
      }
      event.target.value = ''
      return
    }

    var reader = new FileReader()
    var reader = new FileReader();
    const img = new Image();

    img.src = window.URL.createObjectURL(details[0]);
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = (_event) => {
      setTimeout(() => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        window.URL.revokeObjectURL(img.src);
        if (width > 3000 || height > 3000) {
          this.toast.error('Image of height and width should be less than 3000px')
          event.target.value = ''
        } else {
          this.uploadFile(event)
        }
      }, 1000);
    }
    // return data
  }

  uploadFile(event) {
    this.formData = new FormData();
    for (const file of event.target.files) {
      this.formData.append("avatar", file);
    }
    this.sharedService.fileUpload(this.formData, this.reason).subscribe(
      res => {
        if (this.index != null && this.index != undefined) {
          const data = {
            index: this.index,
            uploadData: res.uploadFile,
            listView: true
          }
          this.upload.emit(data);
        }
        else if (this.type == 'formField') {
          this.selectedFile = res.uploadFile;
          const data = {
            uploadData: res.uploadFile,
            fieldName: this.formFieldName
          }
          this.upload.emit(data);
        }
        else {
          this.upload.emit(res.uploadFile);
        }
        this.file.nativeElement.value = '';
        this.ref.detectChanges();
      },
      err => {
        this.file.nativeElement.value = '';
        this.toast.error(err['error']['message']);
        this.ref.detectChanges();
      }
    );
  }

  removeFile(event) {
    if (this.type == 'formField') {
      const data = {
        fieldName: this.formFieldName
      }
      this.remove.emit(data);
    } else {
      this.remove.emit(this.index);
    }
    this.selectedFile = null;
    this.selectedFileForKyc = null;
    this.file.nativeElement.value = '';
  }
}