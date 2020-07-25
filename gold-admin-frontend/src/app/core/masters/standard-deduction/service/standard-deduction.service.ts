import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class StandardDeductionService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(
    public http: HttpClient,
    public toastr: ToastrService,
  ) { }

  getAllStandardDeduction(from, to, search): Observable<any> {
    return this.http.get(`/api/scrap/standard-deduction?search=${search}&from=${from}&to=${to}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      }))
  }

  updateStandardDeduction(id, standardDeduction): Observable<any> {
    return this.http.put(`/api/scrap/standard-deduction/${id}`, { standardDeduction }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      }))
  }

  addStandardDeduction(standardDeduction): Observable<any> {
    return this.http.post(`/api/scrap/standard-deduction`, { standardDeduction }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      }))
  }

  deleteStandardDeduction(id): Observable<any> {
    return this.http.delete(`/api/scrap/standard-deduction/${id}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      }))
  }
}
