import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScrapApplicationFormService {
  finalLoanAmount = new BehaviorSubject(0)
  finalLoanAmount$ = this.finalLoanAmount.asObservable()

  constructor(public http: HttpClient) { }

  customerDetails(id): Observable<any> {
    return this.http.get(`/api/scrap/scrap-process/customer-scrap-details/${id}`).pipe(
      map(res => res)
    );
  }

  getScrapDataById(id: number): Observable<any> {
    return this.http.get(`/api/scrap/scrap-process/single-scrap?scrapId=${id}`).pipe(
      map(res => res)
    );
  }

  basicSubmit(details): Observable<any> {
    return this.http.post(`/api/scrap/scrap-process/basic-details`, details).pipe(
      map(res => res)
    );
  }

  acknowledgementSubmit(details, scrapId): Observable<any> {
    let data = { ...details, ...scrapId }
    return this.http.post(`/api/scrap/scrap-process/acknowledgement-details`, data).pipe(
      map(res => res)
    );
  }

  submitOrnaments(scrapOrnaments, finalScrapAmount, scrapIds): Observable<any> {
    let data = {
      scrapOrnaments: scrapOrnaments,
      finalScrapAmount: finalScrapAmount,
      scrapId: scrapIds.scrapId,
    }
    return this.http.post(`/api/scrap/scrap-process/ornaments-details`, data).pipe(
      map(res => res)
    );
  }

  submitFinalIntrest(loanFinalCalculator, masterAndLoanIds, interestTable): Observable<any> {
    let data = {
      loanFinalCalculator: loanFinalCalculator,
      interestTable: interestTable,
      loanId: masterAndLoanIds.loanId,
      masterLoanId: masterAndLoanIds.masterLoanId
    }
    return this.http.post(`/api/loan-process/final-loan-details`, data).pipe(
      map(res => res)
    )
  }

  submitBank(details, masterAndLoanIds): Observable<any> {
    let data = { ...details, ...masterAndLoanIds }
    return this.http.post(`/api/loan-process/bank-details`, data).pipe(
      map(res => res)
    )
  }

  applyForLoan(details, masterAndLoanIds): Observable<any> {
    let data = { ...details, ...masterAndLoanIds }
    return this.http.post(`/api/loan-process/appraiser-rating`, data).pipe(
      map(res => res)
    )
  }

  updateLoan(id, data): Observable<any> {
    return this.http.put(`/api/loan-process/change-loan-detail/${id}`, data).pipe(
      map(res => res)
    )
  }

  uploadDocuments(details, masterAndLoanIds): Observable<any> {
    let data = { ...details, ...masterAndLoanIds }
    return this.http.post(`/api/loan-process/loan-documents`, data).pipe(
      map(res => res)
    )
  }

}
