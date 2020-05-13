import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminLogService {

  constructor(private http: HttpClient) { }

  getAllAdminLogs(from?, to?, search?): Observable<any> {
    return this.http
      .get<any>(`/api/admin-logs?search=${search}&from=${from}&to=${to}`, { observe: 'response' })
      .pipe(map(response => response.body));
  }
}
