import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WalletPriceService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(private http: HttpClient) { }

  getAllBranch(from?, to?, search?, fromDate?, toDate?, userId?): Observable<any> {
    return this.http.get<any>(`/api/partner-branch?search=${search}&from=${from}&to=${to}`);
  }

  addWalletPrice(data): Observable<any> {
    return this.http.post<any>(`/api/partner-branch`, data);
  }

  updateWalletPrice(id, data): Observable<any> {
    return this.http.put<any>(`/api/partner-branch/${id}`, data);
  }
}
