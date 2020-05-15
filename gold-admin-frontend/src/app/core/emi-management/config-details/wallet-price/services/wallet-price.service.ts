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
      .get<any>(`http://173.249.49.7:9120/api/wallet`, { observe: 'response' })
      .pipe(map(response => response.body));
  }

  addWalletPrice(data): Observable<any> {
    return this.http.post<any>(`http://173.249.49.7:9120/api/wallet`, data);
  }

  updateWalletPrice(id, data): Observable<any> {
    return this.http.put<any>(`http://173.249.49.7:9120/api/wallet/${id}`, data);
  }
}
