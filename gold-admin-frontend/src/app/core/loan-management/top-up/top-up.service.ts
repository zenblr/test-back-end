import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TopUpService {

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  getTopupDetails(id): Observable<any> {
    return this.http.get(`/api/part-payment/part-payment-info?masterLoanId=${id}`).pipe(
      map(res => res)
    )
  }



}
