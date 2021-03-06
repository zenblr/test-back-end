import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap, catchError } from 'rxjs/operators';
import { ExcelService } from '../../../../_base/crud/services/excel.service';
import { API_ENDPOINT } from '../../../../../app.constant';


@Injectable({
  providedIn: 'root'
})
export class BulkUploadProductService {
  constructor(private http: HttpClient, private excelService: ExcelService) { }

  bulkUploadFile(data): Observable<any> {
    return this.http.post<any>(API_ENDPOINT + `api/bulk-upload-file`, data);
  }

  addProductFromExcel(data): Observable<any> {
    return this.http.post<any>(API_ENDPOINT + `api/products/from-excel`, data);
  }

  editProductFromExcel(data): Observable<any> {
    return this.http.put<any>(API_ENDPOINT + `api/products/from-excel`, data);
  }

  getProductReport(): Observable<any> {
    return this.http.get(API_ENDPOINT + `api/products/get-product-report`, { responseType: 'arraybuffer' })
      .pipe(
        map((res) => {
          return res;
        }),
        tap(
          data => this.excelService.saveAsExcelFile(data, 'AllProductReport_' + Date.now()),
          error => console.log(error),
        ),
        catchError(err => {
          return null;
        })
      );
  }
}
