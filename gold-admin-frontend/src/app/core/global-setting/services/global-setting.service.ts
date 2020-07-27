import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GlobalSettingService {

  constructor(
    public toastr: ToastrService,
    public http: HttpClient) { }

  globalSetting: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  globalSetting$: Observable<any> = this.globalSetting.asObservable();

  setGlobalSetting(params): Observable<any> {
    return this.http.post(`/api/global-setting`, params).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }

  getGlobalSetting(): Observable<any> {
    return this.http.get(`/api/global-setting`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }

  setScrapGlobalSetting(params): Observable<any> {
    return this.http.post(`/api/scrap/global-setting`, params).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }

  getScrapGlobalSetting(): Observable<any> {
    return this.http.get(`/api/scrap/global-setting`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }
}
