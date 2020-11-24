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

  getInvestmentTenure(from, to, search, investmentTenureStatus): Observable<any> {
    return this.http.get(API_ENDPOINT + `api/gold-sip/sip-investment-tenure?from=${from}&to=${to}&search=${search}&investmentTenureStatus=${investmentTenureStatus}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  // getLeadSourceWithoutPagination(): Observable<any> {
  //   return this.http.get(`/api/gold-sip/sip-cycle-date/get-all-sip-cycle-date?from=${1}&to=${-1}`).pipe(
  //     map(res => res),
  //     catchError(err => {
  //       if (err.error.message)
  //         this.toastr.error(err.error.message);
  //       throw (err);
  //     })
  //   );
  // }

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
    return this.http.put<any>(API_ENDPOINT + `api/gold-sip/sip-investment-tenure/`+ id,  data ).pipe(
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
