import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AppraiserService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(public http: HttpClient, private toastr: ToastrService) { }

  getAllAppraiser(internalBranchId?): Observable<any> {
    const reqParams: any = {}
    if (internalBranchId) {
      reqParams.internalBranchId = internalBranchId
    }
    return this.http.get(`/api/user/appraiser-list`, { params: reqParams }).pipe(
      map(res => res)
    )
  }
  assignAppraiser(value): Observable<any> {
    return this.http.post(`/api/assign-appraiser`, value).pipe(
      map(res => res),
      catchError((err) => {
        if (err.error.message) {
          this.toastr.error(err.error.message)
        }
        throw (err)
      }))
  }

  updateAppraiser(id, value): Observable<any> {
    return this.http.put(`/api/assign-appraiser/${id}`, value).pipe(
      map(res => res),
      catchError((err) => {
        if (err.error.message) {
          this.toastr.error(err.error.message)
        }
        throw (err)
      }))

  }
  getAppraiserList(search, from, to): Observable<any> {
    return this.http.get(`/api/assign-appraiser?search=${search}&to=${to}&from=${from}`).pipe(
      map(res => res)
    )
  }
  getCustomer(): Observable<any> {
    return this.http.get(`/api/customer/customer-unique`).pipe(
      map(res => res)
    )
  }

  assignAppraiserPartRelease(value): Observable<any> {
    return this.http.post(`/api/jewellery-release/assign-appraiser`, value).pipe(
      map(res => res),
      catchError((err) => {
        if (err.error.message) {
          this.toastr.error(err.error.message)
        }
        throw (err)
      }))
  }

  updateAppraiserPartRelease(value): Observable<any> {
    return this.http.put(`/api/jewellery-release/update-appraiser`, value).pipe(
      map(res => res),
      catchError((err) => {
        if (err.error.message) {
          this.toastr.error(err.error.message)
        }
        throw (err)
      }))
  }
}