import { Component, OnInit, Inject, ElementRef, AfterViewInit, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'kt-image-preview-dialog',
  templateUrl: './image-preview-dialog.html',
  styles: [`.mat-dialog-container:{background:transparent !important}
  .px-40 {padding : 0px 40px !important}
  img{ border-radius:15px !important; }
  :focus { outline: none; }
  .viewImage { max-height: 300px; max-width: 300px; }
  .cancel{     position: absolute;
    top: 0;
    right: 0;
    height: 30px;
    z-index:1;
  cursor:pointer}
  `]
})
export class ImagePreviewDialogComponent implements OnInit, AfterViewInit {
  @Input() viewImages = [];
  @Input() type = '';
  images: any[] = [];
  index: number = null;
  removePadding = false;
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
    if (this.type != 'view') {
      this.index = this.data.index;
      var temp = []
      for (let index = 0; index < this.data.images.length; index++) {
        if (index >= this.index) {
          this.images.push(this.data.images[index]);
        } else {
          temp.push(this.data.images[index]);
        }
      }
      Array.prototype.push.apply(this.images, temp);
      if(this.data.modal){
        this.removePadding = true;
      }
    }

    

  }

  ngAfterViewInit() {
    var el = (document.querySelector('.mat-dialog-container') as HTMLElement)
    el.style.background = "transparent";
    el.style.boxShadow = "none";
  }

  close(){
    this.dialogRef.close()
  }
}
