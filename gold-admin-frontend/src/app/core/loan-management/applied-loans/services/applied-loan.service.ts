import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppliedLoanService {

  constructor(
    private http:HttpClient
  ) { }

  getAplliedLoans(search,from,to):Observable<any>{
    return this.http.get(`/api/loan-process/applied-loan-details?search=${search}&from=${from}&to=${to}`).pipe(
      map(res =>res)
    )
  }
  
  disburse(details):Observable<any>{
    return this.http.post(`/api/loan-process/disbursement-of-loan`,details).pipe(
      map(res => res)
    )
  }
}
