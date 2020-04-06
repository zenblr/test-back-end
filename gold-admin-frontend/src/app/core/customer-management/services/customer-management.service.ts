import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerManagementService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(private http: HttpClient) { }

  getAllLeads(from, to, fromDate, search, toDate, userId): Observable<any> {
    return this.http.get<any>(`/api/leads`);
  }

  addLead(data): Observable<any> {
    return this.http.post<any>(`/api/leads`, data);
  }

  sendOtp(data): Observable<any> {
    return this.http.post<any>(`/api/user/registerOtp`, data);
  }

  verifyOtp(data): Observable<any> {
    return this.http.post<any>(`/api/user/verifyOtp`, data);
  }

  resendOtp(data): Observable<any> {
    return this.http.post<any>(`/api/user/resendOtp`, data);
  }

  deleteCustomer(id): Observable<any> {
    return this.http.delete<any>(`/api/user/delete/${id}`);
  }
}
