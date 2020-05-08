import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WalletPriceService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(private http: HttpClient) { }

  getWalletPrice(): Observable<any> {
    return this.http
      .get<any>(`/api/wallet`, { observe: 'response' })
      .pipe(map(response => response.body));
  }

  addWalletPrice(data): Observable<any> {
    return this.http.post<any>(`/api/wallet`, data);
  }

  updateWalletPrice(id, data): Observable<any> {
    return this.http.put<any>(`/api/wallet/${id}`, data);
  }
}
