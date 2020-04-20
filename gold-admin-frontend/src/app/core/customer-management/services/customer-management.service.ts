import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerManagementService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  toggle = new BehaviorSubject<any>('list');
  toggle$ = this.toggle.asObservable();

  constructor(private http: HttpClient) { }

  getAllLeads(from, to, search, stageName): Observable<any> {
    return this.http.get<any>(`/api/customer?search=${search}&from=${from}&to=${to}&stageName=${stageName}`); // stageName=lead in queryParams
  }

  addLead(data): Observable<any> {
    return this.http.post<any>(`/api/customer`, data);
  }

  sendOtp(data): Observable<any> {
    return this.http.post<any>(`/api/customer/send-register-otp`, data); //mobile
  }

  verifyOtp(data): Observable<any> {
    return this.http.post<any>(`/api/customer/verify-otp`, data); // ref,otp
  }

  resendOtp(data): Observable<any> {
    return this.http.post<any>(`/api/customer/resend-otp`, data);
  }

  verifyPAN(data): Observable<any> {
    return this.http.post<any>(`/api/customer/verify-pan`, data);
  }

  deleteCustomer(id): Observable<any> {
    return this.http.delete<any>(`/api/customer/delete/${id}`);
  }
}
