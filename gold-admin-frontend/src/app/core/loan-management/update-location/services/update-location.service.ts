import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UpdateLocationService {

  constructor(public http: HttpClient, private toastr: ToastrService) { }

  getDetailsByMobile(query): Observable<any> {
    return this.http.get(`/api/packet-tracking/user-name`, { params: query }).pipe(map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }

  sendCustomerOtp(mobileNumber: string): Observable<any> {
    return this.http.post<any>(`/api/customer/send-otp`, { mobileNumber }).pipe(map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }

  sendPartnerOtp(mobileNumber: string): Observable<any> {
    return this.http.post<any>(`/api/partner-branch-user/send-otp`, { mobileNumber }).pipe(map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }

  verifyPartnerOtp(params): Observable<any> {
    return this.http.post<any>(`/api/partner-branch-user/verify-otp`, params).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }

  addPacketLocation(data): Observable<any> {
    return this.http.post<any>(`/api/packet-tracking`, data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  submitPacketLocation(data): Observable<any> {
    return this.http.post<any>(`/api/packet-tracking/submit-packet-location`, data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  getLocation(query): Observable<any> {
    return this.http.get(`/api/packet-tracking/get-particular-location`, { params: query }).pipe(map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }

  getNextPacketLocation(reqParams): Observable<any> {
    return this.http.get(`/api/packet-tracking/next-packet-location`, { params: reqParams }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message);
        throw (err);
      }))
  }

  deliverPartnerBranch(data): Observable<any> {
    return this.http.post<any>(`/api/packet-tracking/delivery-approval`, data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

}
