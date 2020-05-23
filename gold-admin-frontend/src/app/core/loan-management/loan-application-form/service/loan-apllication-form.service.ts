import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoanApplicationFormService {

  constructor(public http: HttpClient) { }

  customerDetails(id): Observable<any> {
    return this.http.get(`/api/loan-process/customer-loan-details/${id}`).pipe(
      map(res => res)
    )
  }

  applyForLoan(data): Observable<any> {
    return this.http.post(`/api/loan-process/apply-for-loan`, data).pipe(
      map(res => res)
    )
  }

  getLoanDataById(id: number): Observable<any> {
    return this.http.get(`/api/loan-process/single-loan?customerLoanId=${id}`).pipe(
      map(res => res)
    )
  }

  updateLoan(id, data): Observable<any> {
    return this.http.put(`/api/loan-process/change-loan-detail/${id}`, data).pipe(
      map(res => res)
    )
  }

  getOrnamentType(): Observable<any> {
    return this.http.get(`/api/loan-process/ornament`).pipe(
      map(res => res)
    )
  }

}
