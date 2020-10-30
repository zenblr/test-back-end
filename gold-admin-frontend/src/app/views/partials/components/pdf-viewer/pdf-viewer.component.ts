import { Component, OnInit, Inject, ChangeDetectionStrategy, ChangeDetectorRef, Input, SimpleChanges, OnChanges, ApplicationRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PDFProgressData } from 'ng2-pdf-viewer';
import { SpinnerVisibilityService } from 'ng-http-loader';

@Component({
  selector: 'kt-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
  // changeDetection: ChangeDetectionStrategy.Default
})
export class PdfViewerComponent implements OnInit, OnChanges {


  @Input() page: number
  @Input() showAll: boolean
  @Input() pdfSrc;
  show = false
  src: any = '';

  constructor(
    public dialogRef: MatDialogRef<PdfViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ref: ChangeDetectorRef,
    private spinner: SpinnerVisibilityService,
    private appRef: ApplicationRef

  ) {
    spinner.show();
  }

  ngOnChanges(change: SimpleChanges) {
    if (change.pdfSrc && change.pdfSrc.currentValue) {
      // setTimeout(()=>{
      this.src = change.pdfSrc.currentValue
      // })
      // this.ref.markForCheck()
      // this.appRef.attachView(this.src)

      // console.log(change.pdfSrc.currentValue)
    }
  }

  ngOnInit() {
    if (Object.keys(this.data).length) {
      this.page = this.data.page
      this.showAll = this.data.showAll
      this.src = this.data.pdfSrc
    }
  }

  pageRendered(e: CustomEvent) {
    // console.log('(page-rendered)', e);
  }

  onProgress(progressData: PDFProgressData) {
    if (progressData.loaded == progressData.total) {
      this.spinner.hide()
      this.show = true;
    }
    // do anything with progress data. For example progress indicator
  }

  close() {
    this.dialogRef.close()
  }
}
