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

  getAplliedLoans(search, from, to): Observable<any> {
    return this.http.get(`/api/loan-process/applied-loan-details?search=${search}&from=${from}&to=${to}`).pipe(
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
}
