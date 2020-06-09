import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class OrnamentsService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(public http: HttpClient, private toastr: ToastrService) { }

  getOrnamentType(from, to, search): Observable<any> {
    return this.http.get(`/api/ornament-type?from=${from}&to=${to}&search=${search}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
        this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  addOrnaments(name): Observable<any> {
    return this.http.post<any>(`/api/ornament-type`, {name}).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
        this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  updateOrnaments(id, name): Observable<any> {
    return this.http.put<any>(`/api/ornament-type/${id}`, {name}).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
        this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  deleteOrnament(id): Observable<any> {
    return this.http.delete<any>(`/api/ornament-type?id=${id}&isActive=false`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
        this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }
}
