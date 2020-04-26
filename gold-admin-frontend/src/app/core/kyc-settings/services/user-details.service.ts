import { Injectable, ViewChild } from '@angular/core';
import { ToastrComponent } from '../../../views/partials/components';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class UserDetailsService {

  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent
  public userData: any;

  constructor(private http: HttpClient, private _toastr: ToastrService) { }


  sendOtp(data): Observable<any> {
    return this.http.post<any>(`/api/kyc/get-customer-detail`, data).pipe(
      map(res => res),
      catchError(err => {
        console.log(err);
        this._toastr.error(err.error.message);
        throw (err);
      })
    ); // mobile
  }

  verifyOtp(data): Observable<any> {
    return this.http.post<any>(`/api/customer/verify-otp`, data).pipe(
      map(res => res),
      catchError(err => {
        this._toastr.error(err.error.message);
        throw (err);
      })
    ); // ref,otp
  }

  resendOtp(data): Observable<any> {
    return this.http.post<any>(`/api/customer/resend-otp`, data).pipe(
      map(res => res),
      catchError(err => {
        this._toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  verifyPAN(data): Observable<any> {
    return this.http.post<any>(`/api/customer/verify-pan`, data).pipe(
      map(res => res),
      catchError(err => {
        this._toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  // customer info
  basicDetails(data): Observable<any> {
    return this.http.post<any>(`/api/kyc/customer-info`, data).pipe(
      tap(res => this.userData = res),
      catchError(err => {
        this._toastr.error(err.error.message);
        throw (err);
      })
    );
  }

}
