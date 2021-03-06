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
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err)
      }))
  }

  getReasonsList(): Observable<any> {
    return this.http.get(`/api/rating-reason?from=1&to=-1`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err)
      }))
  }

  cceRating(data): Observable<any> {
    return this.http.post(`/api/classification/cce`, data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err)
      }))
  }

  opsTeamRating(data): Observable<any> {
    return this.http.post(`/api/classification/ops-team`, data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err)
      }))
  }
}
