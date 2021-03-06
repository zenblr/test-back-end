import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class UserPersonalService {

  kycDetails;
  panType = new BehaviorSubject('')
  panType$ = this.panType.asObservable()

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  getOccupation(): Observable<any> {
    return this.http.get(`/api/occupation`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err)
      }))
  }

  personalDetails(data): Observable<any> {
    return this.http.post(`/api/kyc/customer-kyc-personal`, data).pipe(
      tap(res => {
        this.kycDetails = res;
        return res;
      }),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err)
      }))
  }

  getUserDetails(customerId): Observable<any> {
    return this.http.get(`/api/e-kyc/data?customerId=${customerId}`).pipe(
      tap(res => {
        this.kycDetails = res;
        return res;
      }),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err)
      }))
  }
}
