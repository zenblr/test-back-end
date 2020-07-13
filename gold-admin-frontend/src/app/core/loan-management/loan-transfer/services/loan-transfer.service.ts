import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoanTransferService {

  constructor(public http: HttpClient, private toastr: ToastrService) { }

  loadLoanTransferList(from, to, search) {
    return this.http.get(`/api/loan-process/loan-details?search=${search}&from=${from}&to${to}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message)
        throw (err)
      })
    );
  }

  getCustomerDetailsForTransfer(id):Observable<any> {
    return this.http.get(`/api/loan-transfer/${id}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message)
        throw (err)
      })
    );
  }

  basicSubmit(details): Observable<any> {
    return this.http.post(`/api/loan-transfer/basic-details`, details).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message)
        throw (err)
      })
    );
    
  }

  uploadDocuments(details, masterAndLoanIds): Observable<any> {
    details.pawnTicket = details.pawnCopy
    let data = { ...details, ...masterAndLoanIds }
    return this.http.post(`/api/loan-transfer/documents`, data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message)
        throw (err)
      })
    );
  }

  approval(details, masterAndLoanIds): Observable<any> {
    let data = { ...details, ...masterAndLoanIds }
    return this.http.post(`/api/loan-transfer/bm-rating`, data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message)
        throw (err)
      })
    );
  }

  disbursal(details, masterAndLoanIds): Observable<any> {
    let data = { ...details, ...masterAndLoanIds }
    return this.http.post(`/api/loan-transfer/disbursal`, data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message)
        throw (err)
      })
    );
  }

  getSingleUserData(id): Observable<any> {
    return this.http.get(`/api/loan-transfer/${id}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message)
        throw (err)
      })
    );
  }
}
