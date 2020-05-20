import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap, catchError } from 'rxjs/operators';
import { ExcelService } from '../../../../_base/crud/services/excel.service';

@Injectable({
  providedIn: 'root'
})
export class WalletPriceService {
  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  download = new BehaviorSubject<any>(false);
  download$ = this.download.asObservable();

  downloadReport = new BehaviorSubject<any>(false);
  downloadReport$ = this.downloadReport.asObservable();

  constructor(private http: HttpClient, private excelService: ExcelService) { }

  getWalletPrice(): Observable<any> {
    return this.http
      .get<any>(`http://173.249.49.7:9120/api/wallet`, { observe: 'response' })
      .pipe(map(response => response.body));
  }

  addWalletPrice(data): Observable<any> {
    return this.http.post<any>(`http://173.249.49.7:9120/api/wallet`, data);
  }

  updateWalletPrice(id, data): Observable<any> {
    return this.http.put<any>(`http://173.249.49.7:9120/api/wallet/${id}`, data);
  }

  report(): Observable<any> {
    return this.http
      .get(`http://173.249.49.7:9120/api/wallet/wallet-update-report`, { responseType: 'arraybuffer' })
      .pipe(
        map((res) => {
          return res;
        }),
        tap(
          data => {
            this.excelService.saveAsExcelFile(data, 'WalletPriceReport')
          },
          error => console.log(error),
        ),
        catchError(err => {
          return null;
        })
      );
  }
}
