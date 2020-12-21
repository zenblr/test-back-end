import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { map, catchError } from 'rxjs/operators';
import { API_ENDPOINT } from '../../../../app.constant';

@Injectable({
  providedIn: 'root'
})
export class SipApplicationService {
  
  
  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();


  constructor(public http: HttpClient, private toastr: ToastrService) { }

  getSipApplication(from, to, search): Observable<any> {
    return this.http.get(API_ENDPOINT + `api/gold-sip/sip-application/get-sip-application?from=${from}&to=${to}&search=${search}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }


  
  addMobile(mobileNumber): Observable<any> {
    return this.http.get<any>(API_ENDPOINT + `api/gold-sip/customer?mobileNumber=${mobileNumber}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  addSipApplication(data): Observable<any> {
    return this.http.post<any>(API_ENDPOINT + `api/gold-sip/sip-application/create-sip-admin`,data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  getAllCycleDate(){   
    return this.http.get(API_ENDPOINT + `api/gold-sip/sip-cycle-date/get-all-sip-cycle-date`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );

  }

  getAllInvestmentTenure(){   
    return this.http.get(API_ENDPOINT + `api/gold-sip/sip-investment-tenure/get-all-investment-tenure`).pipe(
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

  addCycleDate(data): Observable<any> {
    return this.http.post<any>(API_ENDPOINT + `api/gold-sip/sip-cycle-date`, data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  updateIndividual(id, data): Observable<any> {
    return this.http.put<any>(API_ENDPOINT + `api/gold-sip/sip-application/`+ id, data ).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  getIndividual(id): Observable<any> {
    return this.http.get<any>(API_ENDPOINT + `api/gold-sip/sip-application/`+ id ).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  deleteCycleDate(id): Observable<any> {
    return this.http.delete<any>(API_ENDPOINT + `api/gold-sip/sip-cycle-date?id=${id}&isActive=false`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }
}
