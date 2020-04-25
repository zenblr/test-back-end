import { Component, OnInit, Inject, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'kt-image-preview-dialog',
  template: ` <img [src]=images[index] class="d-block m-auto">`,
  styles: [`.mat-dialog-container:{background:transparent !important}
  `]

})
export class ImagePreviewDialogComponent implements OnInit ,AfterViewInit {

  images: [] = [];
  index: number = null;
  constructor(public dialogRef: MatDialogRef<ImagePreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ele: ElementRef) { }

  ngOnInit() {

    this.images = this.data.images;
    this.index = this.data.index;
    
  }

  ngAfterViewInit() {
    var el =( document.querySelector('.mat-dialog-container') as HTMLElement)
    el.style.background = "transparent";
    el.style.boxShadow = "none";
  }
}
