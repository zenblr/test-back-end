import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AppliedLoanService {

  applyFilter = new BehaviorSubject<any>({});
  applyFilter$ = this.applyFilter.asObservable();

  constructor(
    private http: HttpClient, private toastr: ToastrService
  ) { }

  getAplliedLoans(data): Observable<any> {
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
    if (data && data.appraiserApproval) {
      reqParams.appraiserApproval = data.appraiserApproval;
    }
    return this.http.get(`/api/loan-process/applied-loan-details`, { params: reqParams }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) {
          this.toastr.error(err.error.message)
        }
        throw (err);
      }))
  }

  disburse(details): Observable<any> {
    return this.http.post(`/api/loan-process/disbursement-of-loan`, details).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) {
          this.toastr.error(err.error.message)
        }
        throw (err);
      }))
  }


  getBankDetails(loanId, masterLoanId): Observable<any> {
    return this.http.get(`/api/loan-process/disbursement-loan-bank-detail?loanId=${loanId}&masterLoanId=${masterLoanId}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) {
          this.toastr.error(err.error.message)
        }
        throw (err);
      }))
  }

  generateOTP(id) {
    return this.http.post(`/api/loan-process`, id).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) {
          this.toastr.error(err.error.message)
        }
        throw (err);
      }))
  }

  checkout(customerId): Observable<any> {
    return this.http.get(`/api/packet-tracking/check-out-packet`, { params: { customerId } }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message)
        throw (err);
      }))
  }

  verifyOtp(data): Observable<any> {
    return this.http.post(`/api/packet-tracking/verify-check-out`, data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message)
        throw (err);
      }))
  }
}
