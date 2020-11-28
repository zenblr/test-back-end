import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { map, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppliedKycService {

  editKyc = new BehaviorSubject({ editable: false });
  userData = new BehaviorSubject(undefined);
  userData$ = this.userData.asObservable();

  applyFilter = new BehaviorSubject<any>({});
  applyFilter$ = this.applyFilter.asObservable();

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  getAllKyc(data): Observable<any> {
    const reqParams: any = {};
    if (data && data.from) {
      reqParams.from = data.from;
    }
    if (data && data.to) {
      reqParams.to = data.to;
    }
    if (data && data.search) {
      reqParams.search = data.search;
    }
    if (data && data.kycStatus) {
      reqParams.kycStatus = data.kycStatus;
    }
    if (data && data.cceStatus) {
      reqParams.cceStatus = data.cceStatus;
    }
    if (data && data.scrapKycStatus) {
      reqParams.scrapKycStatus = data.scrapKycStatus;
    }
    if (data && data.scrapKycStatusFromCce) {
      reqParams.scrapKycStatusFromCce = data.scrapKycStatusFromCce;
    }
    if (data && data.modulePoint) {
      reqParams.modulePoint = data.modulePoint
    }

    return this.http.get<any>(`/api/kyc/applied-kyc`, { params: reqParams }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  editKycDetails(params) {
    return this.http.get<any>(`api/kyc/kyc-form-review?customerId=${params.customerId}&customerKycId=${params.customerKycId}`).pipe(
      tap(res => this.userData.next(res)),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }
  // getAllLeads(from, to, search, stageName): Observable<any> {
  //   return this.http.get<any>(`/api/customer?search=${search}&from=${from}&to=${to}&stageName=${stageName}`); // stageName=lead in queryParams
  // }

  changeKYCEditable(data) {
    return this.http.post<any>(`/api/kyc/allow-to-edit`, data)
      .pipe(
        tap((res) => {
          if (res.message) this.toastr.error(res.message)
        }),
        catchError(err => {
          if (err.error.message) this.toastr.error(err.error.message);
          throw (err);
        })
      );
  }
}
