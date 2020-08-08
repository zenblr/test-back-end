import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root'
})
export class OtherChargesService {
  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(
    public http: HttpClient,
    public toastr: ToastrService,
  ) { }
  getAllOtherChrges(from, to, search): Observable<any> {
    return this.http.get(`/api/other-charges?search=${search}&from=${from}&to=${to}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      }))
  }

  updateOtherCharges(id, description): Observable<any> {
    return this.http.put(`/api/other-charges/${id}`, { description }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      }))
  }

  addOtherCharges(description): Observable<any> {
    return this.http.post(`/api/other-charges`, { description }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      }))
  }

  deleteOtherCharges(id): Observable<any> {
    return this.http.delete(`/api/other-charges/${id}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      }))
  }
}
