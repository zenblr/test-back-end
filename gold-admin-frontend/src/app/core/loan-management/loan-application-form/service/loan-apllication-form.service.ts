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

  basicSubmit(details):Observable<any>{
    return this.http.post(`/api/loan-process/basic-details`,details).pipe(
      map(res => res)
    )
  }

  nomineeSubmit(details,loanId):Observable<any>{
    details.loanId = loanId
    return this.http.post(`/api/loan-process/nominee-details`,details).pipe(
      map(res => res)
    )
  }

  submitOrnaments(loanOrnaments,totalEligibleAmt,loanId,):Observable<any>{
    return this.http.post(`/api/loan-process/ornaments-details`,{loanOrnaments,totalEligibleAmt,loanId,}).pipe(
      map(res => res)
    )
  }

  submitFinalIntrest(loanFinalCalculator,loanId):Observable<any>{
    return this.http.post(`/api/loan-process/final-loan-details`,{loanFinalCalculator,loanId}).pipe(
      map(res => res)
    )
  }

  submitBank(details,loanId):Observable<any>{
    details.loanId = loanId
    return this.http.post(`/api/loan-process/bank-details`,details).pipe(
      map(res => res)
    )
  }


  applyForLoan(data,loanId): Observable<any> {
    data.loanId = loanId
    return this.http.post(`/api/loan-process/appraiser-rating`, data).pipe(
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
