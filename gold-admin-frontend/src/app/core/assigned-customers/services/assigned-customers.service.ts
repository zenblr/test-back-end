import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AssignedCustomersService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  getCustomerList(from, to, search): Observable<any> {
    return this.http.get<any>(`/api/loan-process/assign-appraiser-customer?search=${search}&from=${from}&to=${to}`);
  }
}
