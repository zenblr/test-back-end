import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InternalUserBranchService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();
  constructor(private http: HttpClient) { }

  addInternalBranch(value): Observable<any> {
    return this.http.post(`/api/internal-branch`, value).pipe(
      map(res => res)
    )
  }

  getInternalBranch(search, from, to): Observable<any> {
    return this.http.get(`/api/internal-branch?search=${search}&from=${from}&to=${to}`).pipe(
      map(res => res)
    )
  }

  editInternalBranch(value, id): Observable<any> {
    return this.http.put(`/api/internal-branch/${id}`, value).pipe(
      map(res => res)
    )
  }
  delete(isActive, id): Observable<any> {
    return this.http.delete(`/api/internal-branch?isActive=${isActive}&id=${id}`).pipe(
      map(res => res)
    )
  }
}
