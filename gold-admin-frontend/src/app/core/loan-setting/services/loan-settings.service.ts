import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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

  getScheme(): Observable<any> {
    return this.http.get('api/scheme').pipe(
      map(res => res),
      catchError(err => {
        this._toastr.error(err.error.message)
        throw (err)
      }))
  }
  saveScheme(data): Observable<any> {
    return this.http.post('api/scheme', data).pipe(
      map(res => res),
      catchError(err => {
        this._toastr.error(err.error.message)
        throw (err)
      }))
  }
  uplaodCSV(data): Observable<any> {
    return this.http.post('api/upload-scheme', data).pipe(
      map(res => res),
      catchError(err => {
        this._toastr.error(err.error.message)
        throw (err)
      }))
  }

}
