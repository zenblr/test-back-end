import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { map, catchError } from 'rxjs/operators';
import { API_ENDPOINT } from '../../../../app.constant';

@Injectable({
  providedIn: 'root'
})
export class SipInvestmentTenureService {
  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(public http: HttpClient, private toastr: ToastrService) { }

  getInvestmentTenure(event): Observable<any> {
    const reqParams: any = {};
    if (event && event.from) {
      reqParams.from = event.from;
    }
    if (event && event.to) {
      reqParams.to = event.to;
    }
    if (event && event.search) {
      reqParams.search = event.search;
    }
    if (event && event.investmentTenureStatus) {
      reqParams.investmentTenureStatus = event.investmentTenureStatus;
    }
    return this.http.get(API_ENDPOINT + `api/gold-sip/sip-investment-tenure`, {
      params: reqParams,
    }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  addInvestmentTenure(data): Observable<any> {
    return this.http.post<any>(API_ENDPOINT + `api/gold-sip/sip-investment-tenure`, data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  updateInvestmentTenure(id, data): Observable<any> {
    return this.http.put<any>(API_ENDPOINT + `api/gold-sip/sip-investment-tenure/` + id, data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  deleteInvestmentTenure(id): Observable<any> {
    return this.http.delete<any>(API_ENDPOINT + `api/gold-sip/sip-investment-tenure?id=${id}&isActive=false`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }
}
