import { Injectable } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppliedKycService {

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
    // if (data && data.scrapKycStatus) {
    //   reqParams.scrapKycStatus = data.scrapKycStatus;
    // }
    // if (data && data.scrapKycStatusFromCce) {
    //   reqParams.scrapKycStatusFromCce = data.scrapKycStatusFromCce;
    // }
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
}
