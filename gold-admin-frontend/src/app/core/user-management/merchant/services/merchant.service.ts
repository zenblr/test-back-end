import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MerchantService {

  constructor(private http: HttpClient) { }

  baseUrl = 'http://49c2b6a8.ngrok.io';
  userId: BehaviorSubject<any> = new BehaviorSubject(0);
  userId$ = this.userId.asObservable()
  userDetails: BehaviorSubject<any> = new BehaviorSubject('');
  userDetails$ = this.userDetails.asObservable()

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

  editMerchant(details,userId): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/merchant/${userId}`, details).pipe(
      map(res => res)
    )
  }

  merchantCommission(categoryCommission, userId): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/api/merchant/category-commission`, { categoryCommission, userId }).pipe(
        map(res => res)
      )
  }

  getMerchantById(id):Observable<any> {
    return this.http.get(`${this.baseUrl}/api/merchant/${id}`).pipe(
      map(res => res)
    )
  }

  getPermission(id):Observable<any> {
    return this.http.get(`${this.baseUrl}/api/merchant-product/${id}`).pipe
      (map(res => res))
  }

  addProduct(products,allowProductAccess,userId):Observable<any> {
    return this.http.post(`${this.baseUrl}/api/merchant-product`,{products,allowProductAccess,userId}).pipe
      (map(res => res))
  }

  getMerchantCommssion(id):Observable<any>{
    return this.http.get(`${this.baseUrl}/api/merchant-category-commission/${id}`).pipe(
      map(res => res)
    )
  }
}
  
