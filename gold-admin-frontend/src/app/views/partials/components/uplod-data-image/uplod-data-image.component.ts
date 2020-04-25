import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { finalize, catchError, map } from 'rxjs/operators';
import { ToastrComponent } from '../toastr/toastr.component';
import {MatDialog } from '@angular/material'
import { ImagePreviewDialogComponent } from '../image-preview-dialog/image-preview-dialog.component';
import { LayoutUtilsService } from '../../../../core/_base/crud';

@Component({
  selector: 'kt-uplod-data-image',
  templateUrl: './uplod-data-image.component.html',
  styleUrls: ['./uplod-data-image.component.scss']
})
export class UplodDataImageComponent implements OnInit {


  index: number = null;
  @Input() title;
  @Input() images;
  @Output() upload = new EventEmitter();

  @ViewChild("file", { static: false }) file;
  @ViewChild(ToastrComponent, { static: false }) toastr: ToastrComponent;


  constructor(
    private ref: ChangeDetectorRef,
    private sharedService: SharedService,
    public dilaog:MatDialog,
    private layoutUtilsService: LayoutUtilsService,
    private ele:ElementRef
  ) { }


  ngOnInit() {
  }

  uploadImages(event) {
    var details = event.target.files
    if (details.length == 0) {
      this.index == null
    } else {
      this.sharedService.uploadFile(details[0]).pipe(map(res => {
        if (this.index != null) {
          this.images.splice(this.index, 1, res.uploadFile.URL)
          this.index = null;
        } else {
          this.images.push(res.uploadFile.URL)
        }
        this.ref.detectChanges();
      }),
        catchError(err => {
          this.toastr.errorToastr('Please try Again');
          throw err
        }), finalize(() => {
          this.file.nativeElement.value = ''
        })).subscribe()
    }
  }

  edit(index: number) {
    this.file.nativeElement.click()
    this.index = index;
  }

  removeImages(index) {

    const _title = 'Delete Banner';
    const _description = 'Are you sure to permanently delete this banner?';
    const _waitDesciption = 'Banner is deleting...';
    const _deleteMessage = 'Banner has been deleted';

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        console.log(res);
        this.images.splice(index, 1);
        this.ref.detectChanges();
      }
    });



  }

  open(index){
    // this.ele.nativeElement.querySelector('.mat-dialog-container').style.boxShadow = "none";
    // this.ele.nativeElement.querySelector('.mat-dialog-container').style.background = "transparent";
    this.dilaog.open(ImagePreviewDialogComponent,{
      data:{
        images:this.images,
        index:index
      },
      width:"75%"
    })
  }


}
