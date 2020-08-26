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
    return this.http.get(`/api/part-payment/interest-info?masterLoanId=${id}`).pipe(
      map(res => res)
    )
  }

  getPayableAmount(data): Observable<any> {
    return this.http.post(`/api/part-payment/check-part-amount`,data).pipe(
      map(res => res),
      catchError(err=>{
        this.toastr.error(err.error.message);
        throw err
      })
    )
  }

  getPaymentConfirm(masterLoanId,paidAmount):Observable<any>{
    return this.http.post(`/api/part-payment/confirm-payment-info`,{masterLoanId,paidAmount}).pipe(
      map(res => res)
    )
  }

  confirmPayment(masterLoanId,paidAmount,paymentDetails):Observable<any>{
    return this.http.post(`/api/part-payment/payment`,{masterLoanId,paidAmount,paymentDetails}).pipe(
      map(res => res)
    )
  }
}
