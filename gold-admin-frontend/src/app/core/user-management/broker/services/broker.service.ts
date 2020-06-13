import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { API_ENDPOINT } from '../../../../app.constant';

@Injectable({
  providedIn: 'root'
})
export class BrokerService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();
  constructor(private http: HttpClient) { }

  getBroker(search,from,to): Observable<any> {
    return this.http.get(API_ENDPOINT + `api/broker?search=${search}&from=${from}&to=${to}`).pipe(
      map(res => res)
    )
  }

  getAllMerchant():Observable<any>{
    return this.http.get(API_ENDPOINT + `api/merchant/all-merchant`).pipe(
      map(res => res)
    )
  }

  getStatus():Observable<any>{
    return this.http.get(API_ENDPOINT + `api/broker/approval-status`).pipe(
      map(res => res)
    )
  }

  addBroker(value):Observable<any>{
    return this.http.post(API_ENDPOINT + `api/broker`,value).pipe(
      map(res => res)
    )
  }

  updateBroker(value):Observable<any>{
    return this.http.put(API_ENDPOINT + `api/broker/${value.userId}`,value).pipe(
      map(res => res)
    )
  }

  bokerStatus(id,status):Observable<any>{
    return this.http.put(API_ENDPOINT + `api/broker/broker-status`,{id,status}).pipe(
      map(res => res)
    )
  }
}
