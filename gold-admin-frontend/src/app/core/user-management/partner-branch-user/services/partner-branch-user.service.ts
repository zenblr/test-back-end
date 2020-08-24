import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class PartnerBranchUserService {
  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(private http: HttpClient) { }
  loadUser(search, from, to): Observable<any> {
    return this.http.get(`/api/partner-branch-user?search=${search}&from=${from}&to=${to}`).pipe(
      map(res => res)
    )
  }
  addUser(value):Observable<any>{
    return this.http.post(`/api/partner-branch-user`,value).pipe(
      map(res=>res)
    )
  }
  editUser(value,partnerBranchUserId):Observable<any>{
    return this.http.put(`/api/partner-branch-user/${partnerBranchUserId}`,value).pipe(
      map(res=>res)
    )
  }

  deleteUser(id):Observable<any>{
    return this.http.delete(`/api/partner-branch-user/?id=${id}&isActive=${false}`).pipe(
      map(res=>res)
    )
  }

  getAllBranch(id):Observable<any>{
    return this.http.get(`/api/partner-branch-user/${id}`).pipe(
      map(res=>res)
    )
  }
}
