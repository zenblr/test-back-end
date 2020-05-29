import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CustomerClassificationService {

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  getRating(): Observable<any> {
    return this.http.get(`/api/rating`).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message);
        throw (err)
      }))
  }

  getReasonsList(): Observable<any> {
    return this.http.get(`/api/rating-reason`).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message);
        throw (err)
      }))
  }

  cceRating(data): Observable<any> {
    return this.http.post(`/api/classification/cce`, data).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message);
        throw (err)
      }))
  }

  updateCceRating(data): Observable<any> {
    return this.http.put(`/api/classification`, data).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message);
        throw (err)
      }))
  }
}
