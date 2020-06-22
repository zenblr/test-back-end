import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SMSAlertService {
  openDialog = new BehaviorSubject<any>(false);
  openDialog$ = this.openDialog.asObservable();

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  getAllSMSAlert(from?, to?, search?): Observable<any> {
    return this.http.get<any>(`api/sms-alert?search=${search}&from=${from}&to=${to}`);
  }

  addSMSAlert(data): Observable<any> {
    return this.http.post<any>(`api/sms-alert`, data).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message)
        throw (err)
      })
    );
  }

  updateSMSAlert(id, data): Observable<any> {
    return this.http.put<any>(`api/sms-alert/${id}`, data).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message)
        throw (err)
      })
    );
  }
}
