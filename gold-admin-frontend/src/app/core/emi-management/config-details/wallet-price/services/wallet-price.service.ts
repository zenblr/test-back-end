import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap, catchError } from 'rxjs/operators';
import { ExcelService } from '../../../../_base/crud/services/excel.service';
import { API_ENDPOINT } from '../../../../../app.constant';
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
    return this.http.get<any>(API_ENDPOINT + `api/wallet`);
  }

  addWalletPrice(data): Observable<any> {
    return this.http.post<any>(API_ENDPOINT + `api/wallet`, data);
  }

  updateWalletPrice(id, data): Observable<any> {
    return this.http.put<any>(API_ENDPOINT + `api/wallet/${id}`, data);
  }

  report(): Observable<any> {
    return this.http.get(API_ENDPOINT + `api/wallet/wallet-update-report`, { responseType: 'arraybuffer' })
      .pipe(
        map((res) => {
          return res;
        }),
        tap(
          data => {
            this.excelService.saveAsExcelFile(data, 'WalletPriceReport_' + Date.now());
          },
          error => console.log(error),
        ),
        catchError(err => {
          return null;
        })
      );
  }
}
