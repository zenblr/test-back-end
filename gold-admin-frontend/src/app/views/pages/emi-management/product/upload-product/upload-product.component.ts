import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import {UploadBulkProductService} from '../../../../../core/emi-management/product/upload-product/upload-bulk-product.service';
import { BulkUploadReportListComponent } from '../../bulk-upload-report/bulk-upload-report-list/bulk-upload-report-list.component';

@Component({
  selector: 'kt-upload-product',
  templateUrl: './upload-product.component.html',
  styleUrls: ['./upload-product.component.scss']
})
export class UploadProductComponent implements OnInit {

  constructor(public service :UploadBulkProductService, 
    public ref: ChangeDetectorRef,
    public toast: ToastrService,
    public dialog: MatDialog,
    public route: Router) { }

  ngOnInit(): void {
  
  }

  public file: File;
  public enableButtonBulk: boolean = true;
  public previewExcelCondition: boolean = false;
  public uploadPath: any;
  public fileExtension: any;
  public fd;
  public spinnerValue: boolean = false;
  public uploadButton: boolean = false;
  public files:any = [];
  // @ViewChild('defaultupload', { static: false }) public uploadObj:ElementRef;
  // @ViewChild('grid', { static: false }) public gridObj:ElementRef;
  
  
  

  public onSuccess(args: any): void {
    this.files = args.target.files; 
    if (args.target.files.length > 0) {
      this.file = <File>args.target.files[0];
      this.fd = new FormData();
      this.fd.append('avatar', this.file, this.file.name);
      this.uploadButton = true;
    }
  }

  // exportAsXLSX(): void {
  //   this.service.exportAsExcelFile(this.excelFormat, 'sample');
  // }

  // previewExcelNew() {
  
  //   var a = this.excelData;
  //   console.log(a);
  //   const dialogRef = this.dialog.open(PreviewExcelComponent, { data: { a }, width: "65vw", height: "40vw" });
  //   dialogRef.afterClosed().subscribe(res => {
  //   });
  // }

  showReportbutton() {
    this.route.navigateByUrl('/emi-management/bulkUploadReport');
  }

  uploadFiles() {
    this.spinnerValue = true;
    this.service.UploadExcel(this.fd).subscribe(
      res => {
        this.uploadPath = res['uploadFile']['path'];
        var filetype = res['uploadFile']['filename'];
        var extensionObject = filetype.split('.');
        this.fileExtension = extensionObject['1']; 
        let fileId = res['uploadFile']['id'];

        this.service.uploadBulkProduct(fileId,this.fileExtension,this.uploadPath).subscribe(
          res => {
           
            this.toast.success('Success', 'Datasheet Uploaded Successfully', {
              timeOut: 3000
            });
            this.files=[];
            this.ref.detectChanges();
          },
          err => {
           
            this.toast.error('Sorry', err['error']['message'], {
              timeOut: 3000
            });
          }
        );
        this.ref.detectChanges();
      },
      err => {
        this.toast.error('Sorry', err['error']['message'], {
          timeOut: 3000
        });
      }
    );
  }
  exportAsXLSX(): void {
    this.service.exportAsExcelFile(this.excelFormat, 'sample');
  }

  excelFormat: any = [{
    category: '',
    subCategory: '',
    sku: '',
    productName: '',
    weight: '',
    price: '',
    purity: '',
    productImage: '',
    metalType :'',
    karat : '',
    jwelleryType : '',
    manufacturingCostPerGram : '',
  },];
 

}
