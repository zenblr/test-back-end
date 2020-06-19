import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppraiserService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(public http:HttpClient) { }

  getAllAppraiser():Observable<any>{
    return this.http.get(`/api/user/appraiser-list`).pipe(
      map(res => res)
      )
  }
  assignAppraiser(value):Observable<any>{
    return this.http.post(`/api/assign-appraiser`,value).pipe(
      map(res => res)
      )
  }
  
  updateAppraiser(id,value):Observable<any>{
    return this.http.put(`/api/assign-appraiser/${id}`,value).pipe(
      map(res => res)
      )
  }
  getAppraiserList(search,from,to):Observable<any>{
    return this.http.get(`/api/assign-appraiser?search=${search}&to=${to}&from=${from}`).pipe(
      map(res => res)
      )
  }
  getCustomer():Observable<any>{
    return this.http.get(`/api/customer/customer-unique`).pipe(
      map(res => res)
      )
    }
  }
