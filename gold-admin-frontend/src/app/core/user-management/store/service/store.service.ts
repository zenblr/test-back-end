import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { API_ENDPOINT } from '../../../../app.constant';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(public http: HttpClient) { }

  getStore(search, from, to): Observable<any> {
    return this.http.get(API_ENDPOINT + `api/store?search=${search}&from=${from}&to=${to}`).pipe(
      map(res => res)
    )
  }
  createStore(merchantId): Observable<any> {
    return this.http.post(API_ENDPOINT + `api/store`, { merchantId }).pipe(
      map(res => res)
    )
  }
  getStoreByMerchant(id): Observable<any> {
    return this.http.get(API_ENDPOINT + `api/store/${id}`).pipe(
      map(res => res)
    )
  }
}
