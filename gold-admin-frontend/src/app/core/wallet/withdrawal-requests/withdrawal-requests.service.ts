import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WithdrawalRequestsService {

    applyFilter = new BehaviorSubject<any>({});
	applyFilter$ = this.applyFilter.asObservable();


  constructor(public http: HttpClient, private toastr: ToastrService) { }


  getWithdrawalRequests(data): Observable<any> {
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
    if (data && data.paymentFor) {
      reqParams.paymentFor = data.paymentFor;
    }
    return this.http.get('api/wallet/get-request-admin', {
      params: reqParams
    }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }
  
  getWithdrawById(id): Observable<any> {
		return this.http.get<any>(`/api/wallet/${id}`
		);
	}
  
  editWithdrawStatus(data, id): Observable<any> {
		return this.http.put<any>(`/api/wallet/${id}`,
			data
		);
	}



}
