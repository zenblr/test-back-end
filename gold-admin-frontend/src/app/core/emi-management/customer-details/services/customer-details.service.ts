import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap, catchError } from 'rxjs/operators';
import { ExcelService } from '../../../_base/crud/services/excel.service';
import { API_ENDPOINT } from '../../../../app.constant';
@Injectable({
  providedIn: 'root'
})
export class CustomerDetailsService {
  exportExcel = new BehaviorSubject<any>(false);
  exportExcel$ = this.exportExcel.asObservable();

  constructor(private http: HttpClient, private excelService: ExcelService) { }

  getAllCustomerDetails(from?, to?, search?): Observable<any> {
    return this.http.get<any>(API_ENDPOINT + `api/customer?search=${search}&from=${from}&to=${to}`);
  }

  reportExport(): Observable<any> {
    return this.http.get(API_ENDPOINT + `api/customer/customer-report`, { responseType: 'arraybuffer' })
      .pipe(
        map((res) => {
          return res;
        }),
        tap(
          data => {
            this.excelService.saveAsExcelFile(data, 'CustomerReport_' + Date.now());
          },
          error => console.log(error),
        ),
        catchError(err => {
          return null;
        })
      );
  }
}
