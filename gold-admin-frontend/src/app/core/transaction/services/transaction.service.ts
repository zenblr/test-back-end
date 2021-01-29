import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  applyFilter = new BehaviorSubject<any>({});
  applyFilter$ = this.applyFilter.asObservable();

  constructor(private http: HttpClient, private toastr: ToastrService) { }
  getTransaction(data, customerId): Observable<any> {
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
    return this.http.get<any>(`/api/wallet/transaction-detail-admin?customerId=${customerId}`, { params: reqParams })
  }
}
