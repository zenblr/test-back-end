import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { API_ENDPOINT } from '../../../../../app.constant';
@Injectable({
  providedIn: 'root'
})
export class AdminLogService {

  constructor(private http: HttpClient) { }

  getAllAdminLogs(from?, to?, search?): Observable<any> {
    return this.http.get<any>(API_ENDPOINT + `api/admin-logs?search=${search}&from=${from}&to=${to}`);
  }
}
