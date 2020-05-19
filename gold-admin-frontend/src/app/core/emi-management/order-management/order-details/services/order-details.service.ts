import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap, catchError } from 'rxjs/operators';
import { ExcelService } from '../../../../_base/crud/services/excel.service';

@Injectable({
  providedIn: 'root'
})
export class OrderDetailsService {
  exportExcel = new BehaviorSubject<any>(false);
  exportExcel$ = this.exportExcel.asObservable();

  constructor(private http: HttpClient, private excelService: ExcelService) { }

  getAllOrderDetails(from?, to?, search?): Observable<any> {
    return this.http.get<any>(`http://173.249.49.7:9120/api/order?search=${search}&from=${from}&to=${to}`);
  }

  getOrderTrackingLog(id): Observable<any> {
    return this.http.get<any>(`http://173.249.49.7:9120/api/order/order-tracking-log/${id}`);
  }

  getOrderDetails(id): Observable<any> {
    return this.http.get<any>(`http://173.249.49.7:9120/api/order/details/${id}`);
  }

  getOrderLogistic(): Observable<any> {
    return this.http.get<any>(`http://173.249.49.7:9120/api/order/logistic`);
  }

  reportExport(): Observable<any> {
    return this.http.get(`http://173.249.49.7:9120/api/order/order-report`, { responseType: 'arraybuffer' })
      .pipe(
        map((res) => {
          return res;
        }),
        tap(
          data => {
            this.excelService.saveAsExcelFile(data, 'OrderReport')
          },
          error => console.log(error),
        ),
        catchError(err => {
          return null;
        })
      );
  }
}
