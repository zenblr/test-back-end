import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { finalize, catchError, map } from 'rxjs/operators';
import { ToastrComponent } from '../toastr/toastr.component';
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
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;


  constructor(
    private ref:ChangeDetectorRef,
    private sharedService: SharedService,
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
    this.images.splice(index,1)
    this.ref.detectChanges();
  }



}
