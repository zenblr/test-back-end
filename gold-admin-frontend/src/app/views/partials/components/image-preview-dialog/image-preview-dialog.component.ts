import { Component, OnInit, Inject, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'kt-image-preview-dialog',
  templateUrl: './image-preview-dialog.html',
  styles: [`.mat-dialog-container:{background:transparent !important}
  img{
    border-radius:15px !important;
  }
  `]

})
export class ImagePreviewDialogComponent implements OnInit ,AfterViewInit {

  images:any [] = [];
  index: number = null;
  constructor(
    config: NgbCarouselConfig,
    public dialogRef: MatDialogRef<ImagePreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ele: ElementRef) {
      config.interval = 0;
      config.wrap = true;
      config.keyboard = false;
      config.pauseOnHover = false;
      config.showNavigationIndicators = false;
     }

  ngOnInit() {
    this.index = this.data.index;
    var temp = []
    for (let index = 0; index < this.data.images.length; index++) {
     if(index >= this.index){
       this.images.push(this.data.images[index])
     }else{
       temp.push(this.data.images[index])
     }
    }
    Array.prototype.push.apply(this.images,temp)
  }

  ngAfterViewInit() {
    var el =( document.querySelector('.mat-dialog-container') as HTMLElement)
    el.style.background = "transparent";
    el.style.boxShadow = "none";
  }
}
