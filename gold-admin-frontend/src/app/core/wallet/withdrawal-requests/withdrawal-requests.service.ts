import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { map, catchError, tap } from 'rxjs/operators';
import { ExcelService, PdfService } from "../../_base/crud";
import { API_ENDPOINT } from '../../../app.constant';

@Injectable({
  providedIn: 'root'
})
export class WithdrawalRequestsService {
  exportExcel = new BehaviorSubject<any>(false);
  exportExcel$ = this.exportExcel.asObservable();

  applyFilter = new BehaviorSubject<any>({});
  applyFilter$ = this.applyFilter.asObservable();

  constructor(public http: HttpClient,
    private toastr: ToastrService,
    private excelService: ExcelService,
    private pdfService: PdfService
  ) { }

  getWithdrawalRequests(data): Observable<any> {
    const reqParams: any = {};
    if (data && data.from) {
      reqParams.from = data.from;
    }
    if (data && data.to) {
      reqParams.to = data.to;
    }
    if (data && data.search) {
      reqParams.search = data.search;
    }
    if (data && data.paymentFor) {
      reqParams.paymentFor = data.paymentFor;
    }
    if (data && data.paymentReceivedDate) {
      reqParams.paymentReceivedDate = data.paymentReceivedDate;
    }
    if (data && data.depositStatus) {
      reqParams.depositStatus = data.depositStatus;
    }
    return this.http.get('api/wallet/get-request-admin', { params: reqParams }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  getWithdrawById(id): Observable<any> {
    return this.http.get<any>(`/api/wallet/${id}`);
  }

  editWithdrawStatus(data, id): Observable<any> {
    return this.http.put<any>(`/api/wallet/${id}`, data);
  }

  reportExport(event?: any): Observable<any> {
    const reqParams: any = {};
    if (event && event.paymentFor) {
      reqParams.paymentFor = event.paymentFor;
    }
    if (event && event.paymentReceivedDate) {
      reqParams.paymentReceivedDate = event.paymentReceivedDate;
    }
    if (event && event.depositStatus) {
      reqParams.depositStatus = event.depositStatus;
    }
    return this.http
      .get(API_ENDPOINT + `api/order/order-report`, {
        responseType: "arraybuffer", params: reqParams,
      })
      .pipe(
        map((res) => {
          return res;
        }),
        tap(
          (data) => {
            this.excelService.saveAsExcelFile(
              data,
              "OrderReport_" + Date.now()
            );
          },
          (error) => console.log(error)
        ),
        catchError((err) => {
          return null;
        })
      );
  }

}
