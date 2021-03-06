import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ExcelService } from '../../../_base/crud';

@Injectable({
  providedIn: 'root'
})
export class AppliedLoanService {

  applyFilter = new BehaviorSubject<any>({});
  applyFilter$ = this.applyFilter.asObservable();

  constructor(
    private http: HttpClient, private toastr: ToastrService,
    private excelService: ExcelService
  ) { }

  getAplliedLoans(data): Observable<any> {
    const reqParams: any = {};
    if (data && data.from) {
      reqParams.from = data.from;
    }
    if (data && data.to) {
      reqParams.to = data.to;
    }
    if (data && data.search) {
      reqParams.search = data.search;
    }
    if (data && data.appraiserApproval) {
      reqParams.appraiserApproval = data.appraiserApproval;
    }
    if (data && data.bmApproval) {
      reqParams.bmApproval = data.bmApproval;
    }
    if (data && data.operatinalTeamApproval) {
      reqParams.operatinalTeamApproval = data.operatinalTeamApproval;
    }
    return this.http.get(`/api/loan-process/applied-loan-details`, { params: reqParams }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) {
          this.toastr.error(err.error.message)
        }
        throw (err);
      }))
  }

  disburse(details): Observable<any> {
    return this.http.post(`/api/loan-process/disbursement-of-loan`, details).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) {
          this.toastr.error(err.error.message)
        }
        throw (err);
      }))
  }


  getBankDetails(loanId, masterLoanId): Observable<any> {
    return this.http.get(`/api/loan-process/disbursement-loan-bank-detail?loanId=${loanId}&masterLoanId=${masterLoanId}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) {
          this.toastr.error(err.error.message)
        }
        throw (err);
      }))
  }

  generateOTP(id) {
    return this.http.post(`/api/loan-process`, id).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) {
          this.toastr.error(err.error.message)
        }
        throw (err);
      }))
  }

  checkout(customerId): Observable<any> {
    return this.http.get(`/api/packet-tracking/check-out-packet`, { params: { customerId } }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message)
        throw (err);
      }))
  }

  verifyOtp(data): Observable<any> {
    return this.http.post(`/api/packet-tracking/verify-check-out`, data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message)
        throw (err);
      }))
  }

  downloadBankDetails(masterLoanId, type): Observable<any> {
    // console.log(masterLoanId)
    return this.http.get(`api/loan-process/download-bank-details?masterLoanId=${masterLoanId}&type=${type}`, { responseType: 'arraybuffer' })
      .pipe(
        map((res) => {
          return res;
        }),
        tap(
          data => {
            // const fileName = report.originalname.split('.');
            // const file = fileName['0'];
            this.excelService.saveAsExcelFile(data, "BulkReport_" + Date.now())
          },
          error => console.log(error),
        ),
        catchError(err => {
          return null;
        })
      );
  }
}
