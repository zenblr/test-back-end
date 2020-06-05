import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class PurposeService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(
    public http: HttpClient,
    public toastr: ToastrService,
  ) { }

  getAllPurpose(from, to, search): Observable<any> {
    return this.http.get(`/api/purpose?search=${search}&from=${from}&to=${to}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      }))
  }

  updatePurpose(id, name): Observable<any> {
    return this.http.put(`/api/purpose/${id}`, {name}).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      }))
  }

  addPurpose(name): Observable<any> {
    return this.http.post(`/api/purpose`, {name}).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      }))
  }

  deletePurpose(id): Observable<any> {
    return this.http.delete(`/api/purpose?id=${id}&isActive=false`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      }))
  }
}
