import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap, catchError } from 'rxjs/operators';
import { ExcelService } from '../../../../_base/crud/services/excel.service';

@Injectable({
  providedIn: 'root'
})
export class BulkUploadProductService {
  constructor(private http: HttpClient, private excelService: ExcelService) { }

  bulkUploadFile(data): Observable<any> {
    return this.http.post<any>(`/api/bulk-upload-file`, data);
  }

  uploadBulkProduct(data): Observable<any> {
    return this.http.post(`/api/products/from-excel`, data);
  }

  getProductReport(): Observable<any> {
    return this.http.get(`/api/products/get-product-report`, { responseType: 'arraybuffer' })
      .pipe(
        map((res) => {
          return res;
        }),
        tap(
          data => this.excelService.saveAsExcelFile(data, 'AllProductReport'),
          error => console.log(error),
        ),
        catchError(err => {
          return null;
        })
      );
  }

  // exportAsExcelFile(json: any[], excelFileName: string): void {
  //   const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
  //   const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
  //   const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  //   this.saveAsExcelFile(excelBuffer, excelFileName);
  // }

  // saveAsExcelFile(buffer: any, fileName: string): void {
  //   const data: Blob = new Blob([buffer], {
  //     type: EXCEL_TYPE
  //   });
  //   FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  // }
}
