import { Component, OnInit, Inject, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PDFProgressData } from 'ng2-pdf-viewer';
import { SpinnerVisibilityService } from 'ng-http-loader';

@Component({
  selector: 'kt-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PdfViewerComponent implements OnInit {


  @Input() page: number
  @Input() showAll: boolean
  @Input() pdfSrc = "https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf";
  show = false

  constructor(
    public dialogRef: MatDialogRef<PdfViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ref: ChangeDetectorRef,
    private spinner: SpinnerVisibilityService
  ) {
    spinner.show();
  }

  ngOnInit() {
    if (Object.keys(this.data).length) {
      this.page = this.data.page
      this.showAll = this.data.showAll
      this.pdfSrc = this.data.pdfSrc
    }
  }

  onProgress(progressData: PDFProgressData) {
    if (progressData.loaded == progressData.total) {
      this.spinner.hide()
      this.show = true;
    }
    // do anything with progress data. For example progress indicator
  }

}
