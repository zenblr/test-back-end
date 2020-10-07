import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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
    if (data && data.product) {
      reqParams.product = data.product;
    }
    return this.http.get(`/api/cron-list`,{params:reqParams})
  }
}
