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
      map(res => res)
    )
  }

  getPaymentConfirm(masterLoanId):Observable<any>{
    return this.http.get(`/api/part-payment/confirm-payment-info?masterLoanId=${masterLoanId}`).pipe(
      map(res => res)
    )
  }
}
