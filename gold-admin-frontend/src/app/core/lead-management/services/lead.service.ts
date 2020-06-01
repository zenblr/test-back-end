import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class LeadService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  toggle = new BehaviorSubject<any>('list');
  toggle$ = this.toggle.asObservable();

  // @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  getAllLeads(from, to, search, stageName): Observable<any> {
    return this.http.get<any>(`/api/customer?search=${search}&from=${from}&to=${to}&stageName=${stageName}`); // stageName=lead in queryParams
  }

  addLead(data): Observable<any> {
    return this.http.post<any>(`/api/customer`, data);
  }

  getStatus(): Observable<any> {
    return this.http.get<any>(`/api/status`).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  getLeadById(id): Observable<any> {
    return this.http.get<any>(`/api/customer/${id}`).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message)
        throw (err)
      })
    );
  }

  editLead(id, data): Observable<any> {
    return this.http.put<any>(`/api/customer/${id}`, data).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message)
        throw (err)
      })
    );
  }

  sendOtp(data): Observable<any> {
    return this.http.post<any>(`/api/customer/send-register-otp`, data); //mobile
  }

  verifyOtp(data): Observable<any> {
    return this.http.post<any>(`/api/customer/verify-otp`, data).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message)
        throw (err)
      })
    ); // ref,otp
  }

  resendOtp(data): Observable<any> {
    return this.http.post<any>(`/api/customer/resend-otp`, data);
  }

  verifyPAN(data): Observable<any> {
    return this.http.post<any>(`/api/customer/verify-pan`, data);
  }

  getInternalBranhces(): Observable<any> {
    return this.http.get<any>(`api/internal-branch`);
  }

}
