import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError,map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class GoldRateService {


  goldRate = new BehaviorSubject<any>(0);
  goldRate$ = this.goldRate.asObservable();
  
  constructor(
    public toastr:ToastrService,
    public http:HttpClient) { }
  
  getGoldRateLog(): Observable<any> {
    return this.http.get(`/api/gold-rate/log`).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.messgage);
        throw (err);
      })
    )
  }

  getGoldRate(): Observable<any> {
    return this.http.get(`/api/gold-rate`).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.messgage);
        throw (err);
      })
    )
  }

  updateGoldRate(data): Observable<any> {
    return this.http.post(`/api/gold-rate`, data).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }
}
