import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PartPaymentService {

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  getPreviousPartPaymentInfo(id): Observable<any> {
    return this.http.get(`/api/part-payment/part-payment-info?masterLoanId=${id}`).pipe(
      map(res => res)
    )
  }

  getPreviousPartPaymentLogs(id): Observable<any> {
    return this.http.get(`/api/part-payment/view-log?masterLoanId=${id}`).pipe(
      map(res => res)
    )
  }

  getPayableAmount(data): Observable<any> {
    return this.http.post(`/api/part-payment/check-part-amount`, data).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message);
        throw err
      })
    )
  }

  getPaymentConfirm(masterLoanId, paidAmount): Observable<any> {
    return this.http.post(`/api/part-payment/confirm-payment-info`, { masterLoanId, paidAmount }).pipe(
      map(res => res)
    )
  }

  confirmPayment(data): Observable<any> {
    return this.http.post(`/api/part-payment/payment`, data).pipe(
      map(res => res)
    )
  }
  
  finalPaymentConfirm(transactionId, status, masterLoanId): Observable<any> {
    return this.http.post(`/api/part-payment/confirm-payment`, { transactionId, status, masterLoanId }).pipe(
      map(res => res)
    )
  }

  

}
