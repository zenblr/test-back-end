import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReasonsService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(public http: HttpClient, private toastr: ToastrService) { }

  getReasons(from, to, search): Observable<any> {
    return this.http.get(`/api/packet?search=${search}&from=${from}&to=${to}`).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }

  addReason(data): Observable<any> {
    return this.http.post<any>(`/api/packet`, data).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  updateReason(id, data): Observable<any> {
    return this.http.put<any>(`/api/packet/${id}`, data).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  deleteReason(id): Observable<any> {
    return this.http.delete<any>(`/api/packet/${id}`).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }
}
