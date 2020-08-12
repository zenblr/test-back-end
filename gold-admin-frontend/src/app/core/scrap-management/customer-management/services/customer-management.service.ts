import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ScrapCustomerManagementService {
  toggle = new BehaviorSubject<any>('list');
  toggle$ = this.toggle.asObservable();

  customer = new BehaviorSubject<any>({});
  customer$ = this.customer.asObservable()
  constructor(private http: HttpClient, private toastr: ToastrService) { }

  getList(search, from, to): Observable<any> {
    return this.http.get(`/api/scrap/customer/customer-management?search=${search}&from=${from}&to=${to}`).pipe(
      tap(res => {
        this.customer.next(res)
      }),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  getScrapCustomerById(id): Observable<any> {
    return this.http.get(`/api/scrap/customer/customer-management/${id}`)
  }

  getScrapDetails(id): Observable<any> {
    return this.http.get(`/api/scrap/customer/single-scrap-customer?customerScrapId=${id}`).pipe(
      map(res => res)
    )
  }
}
