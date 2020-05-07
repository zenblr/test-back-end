import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {  BehaviorSubject } from 'rxjs';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { HttpUtilsService, QueryParamsModel } from '../../../../../app/core/_base/crud';
import { tap, catchError, map } from 'rxjs/operators';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})



export class UploadBulkProductService { 

  

  constructor(private _http: HttpClient,
		private httpUtils: HttpUtilsService) { }

  public UploadExcel(fd): Observable<any> {
    return this._http.post<any>(`http://173.249.49.7:9120/api/bulk-upload-file`, fd );
  }
  
  

  public uploadBulkProduct(fileid , fileExt , path): Observable<any> {
    const data = {
      "fileId": fileid,
      "fileExtension": fileExt,
      "path": path
    }
  
    return this._http.post<any>(`http://173.249.49.7:9120/api/products/from-excel`, data);
  }

  public exportAsExcelFile(json: any[], excelFileName: string): void {

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

	
}
