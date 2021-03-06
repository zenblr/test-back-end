import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QuickPayService {

  constructor(private http: HttpClient) { }

  interestInfo(id): Observable<any> {
    return this.http.get(`/api/quick-pay/interest-info?masterLoanId=${id}`).pipe(
      map(res => res)
    )
  }

  emiInfo(id): Observable<any> {
    return this.http.get(`/api/quick-pay/interest-table?masterLoanId=${id}`).pipe(
      map(res => res)
    )
  }

  getPayableAmount(id): Observable<any> {
    return this.http.get(`api/quick-pay/payable-amount?masterLoanId=${id}`).pipe(
      map(res => res)
    )
  }

  paymentConfirmation(id, amount): Observable<any> {
    return this.http.get(`api/quick-pay/confirm-payment-info?masterLoanId=${id}&amount=${amount}`).pipe(
      map(res => res)
    )
  }

  payment(data): Observable<any> {
    return this.http.post(`api/quick-pay/payment`, data).pipe(
      map(res => res)
    )
  }

  

  confirmPayment(data): Observable<any> {
    return this.http.post(`/api/quick-pay/confirm-payment`, data).pipe(
      map(res => res)
    )
  }

  getTranscationHistory(id): Observable<any> {
    return this.http.get(`api/quick-pay/transcation-history?masterLoanId=${id}`).pipe(
      map(res => res)
    )
  }
}
