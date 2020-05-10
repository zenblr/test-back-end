import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { finalize, catchError, map } from 'rxjs/operators';
import { ToastrComponent } from '../toastr/toastr.component';
import { MatDialog } from '@angular/material'
import { ImagePreviewDialogComponent } from '../image-preview-dialog/image-preview-dialog.component';
import { LayoutUtilsService } from '../../../../core/_base/crud';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'kt-uplod-preview-image',
  templateUrl: './uplod-preview-image.component.html',
  styleUrls: ['./uplod-preview-image.component.scss']
})
export class UplodPreviewImageComponent implements OnInit {
  @Input() image: any;
  @Input() action: any;
  @Output() upload = new EventEmitter();
  @Output() uploadInList = new EventEmitter();
  formData: any;

  @ViewChild(ToastrComponent, { static: false }) toastr: ToastrComponent;

  constructor(
    private ref: ChangeDetectorRef,
    private sharedService: SharedService,
    public dilaog: MatDialog,
    private layoutUtilsService: LayoutUtilsService,
    private ele: ElementRef,
    private toastrService: ToastrService,
    private router: Router,
    private toast: ToastrService
  ) { }

  ngOnInit() { }

  removeImages(index) {
    const _title = 'Delete Banner';
    const _description = 'Are you sure to permanently delete this banner?';
    const _waitDesciption = 'Banner is deleting...';
    const _deleteMessage = 'Banner has been deleted';

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        console.log(res);
        // this.images.splice(index, 1);
        this.ref.detectChanges();
      }
    });



  }

  uploadFiles(event) {
    this.formData = new FormData();
    for (const file of event.target.files) {
      this.formData.append("avatar", file);
    }
    this.sharedService.fileUpload(this.formData).subscribe(
      res => {
        debugger
        this.upload.emit(res.uploadFile);
        // this.toast.success('Image Uploaded Successfully');
        this.ref.detectChanges();
      },
      err => {
        this.toast.error(err['error']['message']);
        this.ref.detectChanges();
      }
    );
  }

}
