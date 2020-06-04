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

  getOrnaments(search, from, to): Observable<any> {
    return this.http.get(`/api/packet?search=${search}&from=${from}&to=${to}`).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }

  addOrnaments(data): Observable<any> {
    return this.http.post<any>(`/api/packet`, data).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  updateOrnaments(id, data): Observable<any> {
    return this.http.put<any>(`/api/packet/${id}`, data).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }
}
