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

  basicSubmit(details): Observable<any> {
    return this.http.post(`/api/loan-process/basic-details`, details).pipe(
      map(res => res)
    )
  }

  nomineeSubmit(details, masterAndLoanIds): Observable<any> {
    let data ={...details,...masterAndLoanIds}
    return this.http.post(`/api/loan-process/nominee-details`, data).pipe(
      map(res => res)
    )
  }

  submitOrnaments(loanOrnaments, totalEligibleAmt, masterAndLoanIds, ): Observable<any> {
    let data = {
      loanOrnaments:loanOrnaments, 
      totalEligibleAmt:totalEligibleAmt,
      loanId:masterAndLoanIds.loanId,
      masterLoanId:masterAndLoanIds.masterLoanId
    }
    return this.http.post(`/api/loan-process/ornaments-details`, data).pipe(
      map(res => res)
    )
  }

  submitFinalIntrest(loanFinalCalculator, masterAndLoanIds,intrestTable): Observable<any> {
    let data = {
      loanFinalCalculator:loanFinalCalculator, 
      intrestTable:intrestTable,
      loanId:masterAndLoanIds.loanId,
      masterLoanId:masterAndLoanIds.masterLoanId
    }
    return this.http.post(`/api/loan-process/final-loan-details`, data).pipe(
      map(res => res)
    )
  }

  submitBank(details, masterAndLoanIds): Observable<any> {
    let data = {...details, ...masterAndLoanIds}
    return this.http.post(`/api/loan-process/bank-details`, data).pipe(
      map(res => res)
    )
  }


  applyForLoan(details, masterAndLoanIds): Observable<any> {
    let data ={...details,...masterAndLoanIds}
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

  

}
