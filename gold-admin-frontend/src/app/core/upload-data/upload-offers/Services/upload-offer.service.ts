import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class UploadOfferService {

  goldRate = new BehaviorSubject<any>(0);
  goldRate$ = this.goldRate.asObservable();

  constructor(private http: HttpClient, private toastr: ToastrService) { }


  updateGoldRate(data): Observable<any> {
    return this.http.post(`/api/gold-rate`, data).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message);
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

  uploadOffers(fd): Observable<any> {
    return this.http.post<any>(`/api/offer`, { images: fd });
  }

  getOffers(): Observable<any> {
    return this.http.get<any>(`/api/offer`).pipe(
      map(res => res));
  }

  deleteOffers(id): Observable<any> {
    return this.http.delete<any>(`/api/banner/${id}`);

  }
}