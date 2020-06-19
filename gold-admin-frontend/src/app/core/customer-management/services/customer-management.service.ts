import { Injectable, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ToastrComponent } from '../../../views/partials/components';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class CustomerManagementService {

  
  toggle = new BehaviorSubject<any>('list');
  toggle$ = this.toggle.asObservable();

  customer = new BehaviorSubject<any>({});
  customer$ = this.customer.asObservable()
  // @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent
  applyFilter = new BehaviorSubject<any>({});
  applyFilter$ = this.applyFilter.asObservable();

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  

  getCustomers(from, to, search):Observable<any> {
    return this.http.get(`/api/customer/customer-management?search=${search}&from=${from}&to=${to}`).pipe(
      tap(res => {
        this.customer.next(res)
      })
    ) // stageName=lead in queryParams
  }

  getCustomerById(id):Observable<any>{
    return this.http.get(`/api/customer/customer-management/${id}`)
  }


}
