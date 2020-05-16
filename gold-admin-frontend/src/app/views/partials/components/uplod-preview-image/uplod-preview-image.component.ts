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
  @Input() image: any;
  @Input() action: any;
  @Input() type: any;
  @Input() index: any;
  @Output() upload = new EventEmitter();
  @Output() remove = new EventEmitter();
  formData: any;

  @ViewChild(ToastrComponent, { static: false }) toastr: ToastrComponent;

  constructor(
    private ref: ChangeDetectorRef,
    private sharedService: SharedService,
    public dilaog: MatDialog,
    private toast: ToastrService
  ) { }

  ngOnInit() { }

  uploadFile(event) {
    this.formData = new FormData();
    for (const file of event.target.files) {
      this.formData.append("avatar", file);
    }
    this.sharedService.fileUpload(this.formData).subscribe(
      res => {
        if (this.index != null && this.index != undefined) {
          const data = {
            index: this.index,
            uploadData: res.uploadFile,
            listView: true
          }
          this.upload.emit(data);
        } else {
          this.upload.emit(res.uploadFile);
        }
        this.ref.detectChanges();
      },
      err => {
        this.toast.error(err['error']['message']);
        this.ref.detectChanges();
      }
    );
  }

  removeFile(event) {
    this.remove.emit(this.index);
  }
}
