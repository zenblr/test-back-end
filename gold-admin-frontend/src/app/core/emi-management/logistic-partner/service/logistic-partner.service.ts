import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LogisticPartnerService {
  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();


  constructor(private http: HttpClient) { }

  addLogisticPartner(data): Observable<any> {
    return this.http.post<any>(`/api/logistic-partner`, data);
  }

  getAllLogisticPartner(from, to,search): Observable<any> {
    return this.http.get<any>(`/api/logistic-partner?search=${search}&from=${from}&to=${to}`);
  }

  getAllLogisticPartnerWithoutPagination(search?, from?, to?): Observable<any> {
    return this.http.get<any>(`/api/logistic-partner/get-all-logistic-partner?&from=${1}&to=${-1}`);
  }

  getLogisticPartnerById(id): Observable<any> {
    return this.http.get<any>(`/api/logistic-partner/${id}`);
  }

  updateLogisticPartner(id, data): Observable<any> {
    delete data.id
    return this.http.put<any>(`/api/logistic-partner/${id}`, data);
  }

  deletePartner(id): Observable<any> {
    return this.http.delete<any>(`/api/partner?id=${id}&isActive=${false}`);
  }}
