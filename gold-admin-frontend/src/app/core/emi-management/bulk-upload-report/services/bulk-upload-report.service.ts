import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap, catchError } from 'rxjs/operators';
import { ExcelService } from '../../../_base/crud/services/excel.service';
import { API_ENDPOINT } from '../../../../app.constant';
@Injectable({
  providedIn: 'root'
})
export class BulkUploadReportService {
  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(private http: HttpClient, private excelService: ExcelService) { }

  getAllBulkUploadReports(from?, to?, search?): Observable<any> {
    return this.http.get<any>(API_ENDPOINT + `api/bulk-upload-file?search=${search}&from=${from}&to=${to}`);
  }

  reportExport(report): Observable<any> {
    return this.http.get(API_ENDPOINT + `api/bulk-upload-file/get-bulk-report/by-file-id?fileId=${report.id}`, { responseType: 'arraybuffer' })
      .pipe(
        map((res) => {
          return res;
        }),
        tap(
          data => {
            const fileName = report.originalname.split('.');
            const file = fileName['0'];
            this.excelService.saveAsExcelFile(data, "BulkReport_" + Date.now())
          },
          error => console.log(error),
        ),
        catchError(err => {
          return null;
        })
      );
  }
}
