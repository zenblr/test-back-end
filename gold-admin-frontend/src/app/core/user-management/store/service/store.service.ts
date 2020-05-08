import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(public http:HttpClient) { }

  baseUrl ="http://173.249.49.7:9120"
  getStore(search,from,to):Observable<any>{
    return this.http.get(`${this.baseUrl}/api/store?search=${search}&from=${from}&to=${to}`).pipe(
      map(res=> res)
    )
  }
  createStore(merchantId):Observable<any>{
    return this.http.post(`${this.baseUrl}/api/store`,{merchantId}).pipe(
      map(res=> res)
    )
  }
  getStoreByMerchant(id):Observable<any>{
    return this.http.get(`${this.baseUrl}/api/store/${id}`).pipe(
      map(res=> res)
    )
  }
}
