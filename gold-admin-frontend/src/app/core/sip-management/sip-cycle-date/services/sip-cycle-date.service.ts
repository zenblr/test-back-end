import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { map, catchError } from 'rxjs/operators';
import { API_ENDPOINT } from '../../../../app.constant';

@Injectable({
  providedIn: 'root'
})
export class SipCycleDateService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(public http: HttpClient, private toastr: ToastrService) { }

  getCycleDate(from, to, search, cycleDateStatus): Observable<any> {
    return this.http.get(API_ENDPOINT + `api/gold-sip/sip-cycle-date?from=${from}&to=${to}&search=${search}&cycleDateStatus=${cycleDateStatus}`).pipe(
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

  updateCycleDate(id, data): Observable<any> {
    return this.http.put<any>(API_ENDPOINT + `api/gold-sip/sip-cycle-date/`+ id,  data ).pipe(
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

  // getStatus(): Observable<any> {
  //   return this.http.get(`/api/role/all-role`).pipe(map(
  //     res => res
  //   ))
  // }   
}
