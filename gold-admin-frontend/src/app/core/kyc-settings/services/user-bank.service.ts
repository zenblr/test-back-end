import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class UserBankService {

  kycDetails;

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  bankDetails(data): Observable<any> {
    return this.http.post(`/api/kyc/customer-kyc-bank`, data).pipe(
      tap(res => {
        this.kycDetails = res;
      }),
      catchError(err => {
        this.toastr.error(err.error.message);
        throw (err)
      }))
  }

  kycSubmit(data) {
    return this.http.post(`/api/kyc/submit-all-kyc-info`, data).pipe(
      map(res => {
        this.kycDetails = res;
      }))
  }

}
