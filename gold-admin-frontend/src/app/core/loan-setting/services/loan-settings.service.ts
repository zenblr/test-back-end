import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ObservedValueOf } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ExcelService } from '../../_base/crud';

@Injectable({
  providedIn: 'root'
})
export class LoanSettingsService {

  constructor(private http: HttpClient,
    private _toastr: ToastrService,
    private excelService: ExcelService
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
  // old
  // uplaodCSV(data): Observable<any> {
  //   return this.http.post('api/upload-scheme', data).pipe(
  //     map(res => res),
  //     catchError(err => {
  //       if (err.error.message)
  //         this._toastr.error(err.error.message)
  //       throw (err)
  //     }))
  // }

  //new 
  uploadRpg(data): Observable<any> {
    return this.http.post('api/scheme/excel-upload', data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this._toastr.error(err.error.message)
        throw (err)
      }))
  }

  updateRPG(url): Observable<any> {
    return this.http.put('api/scheme/update-rpg', { url }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this._toastr.error(err.error.message)
        throw (err)
      }))
  }


  downloadRpgUpdateSheet(): Observable<any> {
    return this.http.get(`api/scheme/export-scheme`, { responseType: 'arraybuffer' })
      .pipe(
        map((res) => {
          return res;
        }),
        tap(
          data => {
            this.excelService.saveAsExcelFile(data, "RPG" + Date.now())
          },
          error => console.log(error),
        ),
        catchError(err => {
          return null;
        })
      );
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

    return this.http.post('api/scheme/unsecured-scheme', data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) this._toastr.error(err.error.message)
        throw (err)
      }))
  }
}
