import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MerchantService {

  constructor(private http: HttpClient) { }

  baseUrl = 'http://aa68faa8.ngrok.io';
  userId: BehaviorSubject<any> = new BehaviorSubject(0);
  userId$ = this.userId.asObservable()

  getMerchant(search, from, to): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/merchant?search=${search}&from=${from}&to=${to}`).pipe(
      map(res => res)
    )
  }

  merchantPersonalDetails(details): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/merchant`, details).pipe(
      map(res => res)
    )
  }

  merchantCommission(categoryCommission, userId): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/merchant/category-commission`, { categoryCommission, userId }).pipe(
        map(res => res)
      )
  }

  getPermission():Observable<any> {
    return this.http.get(`${this.baseUrl}/api/merchant-product/catalog-permission`).pipe
      (map(res => res))
  }

  addProduct(products,userId):Observable<any> {
    return this.http.post(`${this.baseUrl}/api/merchant-product`,{products,userId}).pipe
      (map(res => res))
  }
}
