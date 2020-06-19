import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LeadSourceService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(public http: HttpClient, private toastr: ToastrService) { }

  getLeadSources(from, to, search): Observable<any> {
    return this.http.get(`/api/ornament-type?from=${from}&to=${to}&search=${search}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
        this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  addLeadSource(name): Observable<any> {
    return this.http.post<any>(`/api/ornament-type`, { name }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
        this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  updateLeadSource(id, name): Observable<any> {
    return this.http.put<any>(`/api/ornament-type/${id}`, { name }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
        this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  deleteLeadSource(id): Observable<any> {
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
