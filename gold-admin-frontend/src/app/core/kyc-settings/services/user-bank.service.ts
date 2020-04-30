import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class UserBankService {

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  bankDetails(data): Observable<any> {
    return this.http.post(`/api/kyc/customer-kyc-bank`, data).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message);
        throw (err)
      }))
  }
}
