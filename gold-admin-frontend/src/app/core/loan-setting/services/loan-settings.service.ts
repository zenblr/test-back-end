import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ObservedValueOf } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class LoanSettingsService {

  constructor(private http: HttpClient,
    private _toastr: ToastrService,
  ) { }

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  applyFilter = new BehaviorSubject<any>({});
  applyFilter$ = this.applyFilter.asObservable();

  getScheme(data): Observable<any> {
    const reqParams: any = {};
    if (data && data.isActive) {
      reqParams.isActive = data.isActive;
    }

    return this.http.get('api/scheme', { params: reqParams }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this._toastr.error(err.error.message)
        throw (err)
      }))
  }
  saveScheme(data): Observable<any> {
    return this.http.post('api/scheme', data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this._toastr.error(err.error.message)
        throw (err)
      }))
  }
  uplaodCSV(data): Observable<any> {
    return this.http.post('api/upload-scheme', data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this._toastr.error(err.error.message)
        throw (err)
      }))
  }

  changeSchemeStatus(id, status): Observable<any> {
    return this.http.delete(`api/scheme?id=${id}&isActive=${status.isActive}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this._toastr.error(err.error.message)
        throw (err)
      }))
  }

  toogleDefault(item): Observable<any> {
    return this.http.put(`api/scheme/update-default/${item.id}`, { partnerId: item.partnerScheme.partnerId }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this._toastr.error(err.error.message)
        throw (err)
      }))
  }

  getUnsecuredSchemes(data): Observable<any> {
    // const reqParams: any = {};
    // if (data && data.isActive) {
    //   reqParams.isActive = data.isActive;
    // }

    return this.http.get('api/getUnsecuredSchemes', data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) this._toastr.error(err.error.message)
        throw (err)
      }))
  }
}
