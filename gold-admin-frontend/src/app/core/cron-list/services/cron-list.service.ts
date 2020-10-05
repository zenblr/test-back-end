import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CronListService {

  constructor(private http:HttpClient) { }

  getCronList(from,to):Observable<any>{
    return this.http.get(`/api/cron-list?from=${from}&to${to}`)
  }
}
