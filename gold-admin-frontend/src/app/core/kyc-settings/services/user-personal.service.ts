import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class UserPersonalService {

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  getOccupation(): Observable<any> {
    return this.http.get(`/api/identity-type`).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message, 'Error!');
        throw (err)
      }))
  }

  personalDetails(data): Observable<any> {
    return this.http.post(`/api/kyc/customer-kyc-personal`, data).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message);
        throw (err)
      }))
  }
}
