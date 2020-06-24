import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HolidayService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  getHolidays(from, to, search): Observable<any> {
    return this.http.get<any>(`/api/holiday-master?search=${search}&from=${from}&to=${to}`)
      .pipe(
        map(res => res),
        catchError(err => {
          if (err.error.message) {
            this.toastr.error(err.error.message);
          }
          throw (err);
        })
      );
  }

  addHoliday(data): Observable<any> {
    return this.http.post<any>(`/api/holiday-master`, data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) {
          this.toastr.error(err.error.message);
        }
        throw (err);
      })
    );
  }

  updateHoliday(id, name): Observable<any> {
    return this.http.put<any>(`/api/holiday-master${id}`, { name }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) {
          this.toastr.error(err.error.message);
        }
        throw (err);
      })
    );
  }

  deleteHoliday(id): Observable<any> {
    return this.http.delete<any>(`/api/holiday-master?id=${id}&isActive=false`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) {
          this.toastr.error(err.error.message);
        }
        throw (err);
      })
    );
  }

  uploadCSV(data): Observable<any> {
    return this.http.post('api/upload-holiday-master', data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) {
          this.toastr.error(err.error.message);
        }
        throw (err)
      }))
  }
}
