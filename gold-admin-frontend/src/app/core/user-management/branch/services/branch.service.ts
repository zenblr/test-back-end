import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(private http: HttpClient) { }

  addBranch(data): Observable<any> {
    return this.http.post<any>(`/api/branch`, data);
  }

  getAllBranch(from?, to?, search?, fromDate?, toDate?, userId?): Observable<any> {
    return this.http.get<any>(`/api/branch?search=${search}&from=${from}&to=${to}`);
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
