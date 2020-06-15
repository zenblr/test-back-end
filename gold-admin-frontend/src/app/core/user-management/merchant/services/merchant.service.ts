import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_ENDPOINT } from '../../../../app.constant';

@Injectable({
  providedIn: 'root'
})
export class MerchantService {

  constructor(private http: HttpClient) { }

  userId: BehaviorSubject<any> = new BehaviorSubject(0);
  userId$ = this.userId.asObservable()
  userDetails: BehaviorSubject<any> = new BehaviorSubject('');
  userDetails$ = this.userDetails.asObservable()

  getMerchant(search, from, to): Observable<any> {
    return this.http.get(API_ENDPOINT + `api/merchant?search=${search}&from=${from}&to=${to}`).pipe(
      map(res => res)
    )
  }

  merchantPersonalDetails(details): Observable<any> {
    return this.http.post(API_ENDPOINT + `api/merchant`, details).pipe(
      map(res => res)
    )
  }

  editMerchant(details, userId): Observable<any> {
    return this.http.put(API_ENDPOINT + `api/merchant/${userId}`, details).pipe(
      map(res => res)
    )
  }

  merchantCommission(categoryCommission, userId): Observable<any> {
    return this.http.put(
      API_ENDPOINT + `api/merchant/category-commission`, { categoryCommission, userId }).pipe(
        map(res => res)
      )
  }

  getMerchantById(id): Observable<any> {
    return this.http.get(API_ENDPOINT + `api/merchant/${id}`).pipe(
      map(res => res)
    )
  }

  getPermission(id): Observable<any> {
    return this.http.get(API_ENDPOINT + `api/merchant-product/${id}`).pipe
      (map(res => res))
  }

  addProduct(products, allProductAccess, userId): Observable<any> {
    return this.http.post(API_ENDPOINT + `api/merchant-product`, { products, allProductAccess, userId }).pipe
      (map(res => res))
  }

  getMerchantCommssion(id): Observable<any> {
    return this.http.get(API_ENDPOINT + `api/merchant-category-commission/${id}`).pipe(
      map(res => res)
    )
  }

  getApiDetails(id): Observable<any> {
    return this.http.get(API_ENDPOINT + `api/merchant/api-key/${id}`).pipe(
      map(res => res)
    )
  }

  generateApi(id): Observable<any> {
    return this.http.get(API_ENDPOINT + `api/merchant/api-key/generate/${id}`).pipe(
      map(res => res)
    )
  }
  reGenerateApi(id): Observable<any> {
    return this.http.get(API_ENDPOINT + `api/merchant/api-key/re-generate/${id}`).pipe(
      map(res => res)
    )
  }

  status(value, userId): Observable<any> {
    return this.http.put(API_ENDPOINT + `api/merchant/api-key/status`, { value, userId }).pipe(
      map(res => res))
  }

  changeStatus(userId, value): Observable<any> {
    return this.http.put(API_ENDPOINT + `api/merchant/approval-status`, { value, userId }).pipe(
      map(res => res))
  }
}

