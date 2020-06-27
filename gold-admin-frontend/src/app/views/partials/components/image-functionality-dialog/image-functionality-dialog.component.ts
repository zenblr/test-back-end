import { Component, OnInit, Inject, ElementRef } from '@angular/core';

// Material
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ImageViewerConfig, CustomImageEvent } from 'angular-x-image-viewer';

@Component({
  selector: 'kt-image-functionality-dialog',
  templateUrl: './image-functionality-dialog.component.html',
  styleUrls: ['./image-functionality-dialog.component.scss']
})
export class ImageFunctionalityDialogComponent implements OnInit {
  preview: any;
  constructor(public dialogRef: MatDialogRef<ImageFunctionalityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ele: ElementRef,
  ) { }

  ngOnInit() {
    this.preview = this.data.data;
    console.log(this.preview);

  }

  ngAfterViewInit() {
    const repeat = (this.ele.nativeElement.querySelector('span.fa.fa-undo.rotate') as HTMLElement)
    repeat.style.transform = "rotate(180deg)";

    const imgContainer = (this.ele.nativeElement.querySelector('div.img-container') as HTMLElement)
    imgContainer.style.position = "unset";
    imgContainer.style.height = "unset";
    imgContainer.style.maxWidth = "unset";
    // imgContainer.style.display = "unset";
    imgContainer.style.backgroundColor = "transparent";

    const imgParentContainer = (this.ele.nativeElement.querySelector('.img-container img') as HTMLElement)
    imgParentContainer.style.maxWidth = "100%";
    imgParentContainer.style.maxHeight = "100%";

  }
  config: ImageViewerConfig = { btnIcons: { rotateClockwise: 'fa fa-undo rotate' } };
}
