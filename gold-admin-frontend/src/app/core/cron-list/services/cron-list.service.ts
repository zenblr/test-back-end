import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { API_ENDPOINT } from '../../../app.constant';


@Injectable({
  providedIn: 'root'
})
export class CronListService {

  applyFilter = new BehaviorSubject<any>({});
  applyFilter$ = this.applyFilter.asObservable();

  constructor(private http:HttpClient) { }

  getCronList(data):Observable<any>{

    const reqParams: any = {};
    if (data && data.from) {
      reqParams.from = data.from;
    }
    if (data && data.to) {
      reqParams.to = data.to;
    }
    if (data && data.search) {
      reqParams.search = data.search;
    }
    if (data && data.status) {
      reqParams.status = data.status;
    }
    if (data && data.date) {
      reqParams.date = data.date;
    }
    if (data && data.cronType) {
      reqParams.cronType = data.cronType;
    }
    if (data && data.product) {
      reqParams.product = data.product;
    }
    return this.http.get(`/api/cron-list`,{params:reqParams})
  }

  penalCron(cronId):Observable<any>{
    return this.http.post(`/api/calculation/penal-cron`,{cronId})
  }

  interestCron(cronId):Observable<any>{
    return this.http.post(`/api/calculation/interest-cron`,{cronId})
  }

  // emi

  cancelOrderDataTransfer(cronId):Observable<any>{
    return this.http.post(`${API_ENDPOINT}api/data-transfer/add-cancel-order-cron`,{cronId})
  }

  depositDataTransfer(cronId):Observable<any>{
    return this.http.post(`${API_ENDPOINT}api/data-transfer/add-deposit-cron`,{cronId})
  }

  userDataTransfer(cronId):Observable<any>{
    return this.http.post(`${API_ENDPOINT}api/data-transfer/add-customer-cron`,{cronId})
  }

  orderDataTransfer(cronId):Observable<any>{
    return this.http.post(`${API_ENDPOINT}api/data-transfer/add-order-cron`,{cronId})
  }

  orderStatusToDefaulter(cronId):Observable<any>{
    return this.http.post(`${API_ENDPOINT}api/data-transfer/defaulter-cron`,{cronId})
  }

  emiReminder(cronId):Observable<any>{
    return this.http.post(`${API_ENDPOINT}api/data-transfer/emi-reminder`,{cronId})
  }
}
