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
    return this.http.get(`/api/quick-pay/interest-info?masterLoanId=${id}`).pipe(
      map(res => res)
    )
  }

  getPayableAmount(queryparams): Observable<any> {
    return this.http.get(`/api/quick-pay/interest-info`, { params: queryparams }).pipe(
      map(res => res)
    )
  }
}
