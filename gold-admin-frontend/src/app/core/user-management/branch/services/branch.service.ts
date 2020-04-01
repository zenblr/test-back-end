import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BranchService {

  constructor(private http: HttpClient) { }

  addBranch(data): Observable<any> {
    return this.http.post<any>(`/api/branch`, data);
  }

  getAllBranch(from, to, fromDate, text, toDate, userId): Observable<any> {
    return this.http.get<any>(`/api/branch`);
  }

  getBranchById(id): Observable<any> {
    return this.http.get<any>(`/api/branch/${id}`);
  }

  updateBranch(id, data): Observable<any> {
    return this.http.put<any>(`/api/branch/${id}`, data);
  }

  deleteBranch(data): Observable<any> {
    return this.http.delete<any>(`/api/branch/${data}`);
  }
}
