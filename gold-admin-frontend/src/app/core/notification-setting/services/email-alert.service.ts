import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmailAlertService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  addAlert(data): Observable<any> {
    return this.http.post<any>(`/api/status`, data).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message)
        throw (err)
      })
    )
  }

  updateAlert(id, data): Observable<any> {
    return this.http.post<any>(`/api/status/${id}`, data).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message)
        throw (err)
      })
    )
  }
}
