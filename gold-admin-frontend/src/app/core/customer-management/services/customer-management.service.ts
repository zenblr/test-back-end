import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerManagementService {

  constructor(private http: HttpClient) { }

  getAllLeads(from, to, fromDate, search, toDate, userId): Observable<any> {
    return this.http.get<any>(`/api/leads`);
  }
}
