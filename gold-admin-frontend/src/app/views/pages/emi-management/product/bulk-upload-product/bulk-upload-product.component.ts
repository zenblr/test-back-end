import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BulkUploadProductService } from '../../../../../core/emi-management/product';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'kt-bulk-upload-product',
  templateUrl: './bulk-upload-product.component.html',
  styleUrls: ['./bulk-upload-product.component.scss']
})
export class BulkUploadProductComponent implements OnInit {
  @ViewChild("file", { static: false }) file;
  formData: any;
  files = [];

  constructor(
    private bulkUploadProductService: BulkUploadProductService,
    private ref: ChangeDetectorRef,
    private toast: ToastrService
  ) { }

  ngOnInit() { }

  getFileDetails(e) {
    this.files = e.target.files;
  }

  uploadFiles() {
    if (!this.files.length) {
      this.toast.error('Please first choose files to upload');
      return;
    }

    this.formData = new FormData();
    for (const file of this.files) {
      this.formData.append("avatar", file);
    }

    this.bulkUploadProductService.bulkUploadFile(this.formData).subscribe(
      res => {
        if (res) {
          const msg = 'Files Uploaded Sucessfully';
          this.toast.success(msg);
          this.files = [];
          this.file.nativeElement.value = '';

          let fileName = res['uploadFile']['filename'].split('.');
          let fileExtension = fileName['1'];
          const fileData = {
            fileId: res['uploadFile']['id'],
            fileExtension: fileExtension,
            path: res['uploadFile']['path']
          }

          console.log(fileData);
          this.bulkUploadProductService.uploadBulkProduct(fileData).subscribe(
            res => {
              console.log(res);
            },
            error => {
              console.log(error);
            }
          );
          this.ref.detectChanges();
        }
      },
      error => {
        console.log(error.error.message);
        const msg = error.error.message;
        this.toast.error(msg);
      },
    )
  }

  getProductReport() {
    this.bulkUploadProductService.getProductReport().subscribe();
  }

  clearFiles() {
    this.files = [];
    this.file.nativeElement.value = '';
  }
}
