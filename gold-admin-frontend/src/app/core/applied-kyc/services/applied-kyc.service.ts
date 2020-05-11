import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppliedKycService {

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  getAllKyc(from, to, search, kycStatus, cceRating, bmRating) {
    return this.http.get<any>(`/api/kyc/applied-kyc?search=${search}&from=${from}&to=${to}&kycStatus=${kycStatus}&cceRating=${cceRating}&bmRating=${bmRating}`).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  // getAllLeads(from, to, search, stageName): Observable<any> {
  //   return this.http.get<any>(`/api/customer?search=${search}&from=${from}&to=${to}&stageName=${stageName}`); // stageName=lead in queryParams
  // }
}
