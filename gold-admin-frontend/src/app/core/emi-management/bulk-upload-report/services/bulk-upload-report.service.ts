import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BulkUploadReportService {
  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(private http: HttpClient) { }

  getAllBulkUploadReports(from?, to?, search?, fromDate?, toDate?, userId?): Observable<any> {
    return this.http
      .get<any>(`http://173.249.49.7:9120/api/bulk-upload-file?search=${search}&from=${from}&to=${to}`, { observe: 'response' })
      .pipe(map(response => response.body));
  }
}
