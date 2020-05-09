import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppliedKycService {

  constructor(private http: HttpClient) { }

  getAllKyc(from, to, search, kycStatus, cceRating, bmRating) {
    return this.http.get<any>(`/api/kyc/applied-kyc?search=${search}&from=${from}&to=${to}&kycStatus=${kycStatus}&cceRating=${cceRating}&bmRating=${bmRating}`);
  }

  // getAllLeads(from, to, search, stageName): Observable<any> {
  //   return this.http.get<any>(`/api/customer?search=${search}&from=${from}&to=${to}&stageName=${stageName}`); // stageName=lead in queryParams
  // }
}
