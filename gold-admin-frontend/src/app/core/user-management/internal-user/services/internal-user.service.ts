import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InternalUserService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();
  constructor(private http:HttpClient) { }

  loadUser(search,from,to):Observable<any>{
    return  this.http.get(`/api/user/internal-user?search=${search}&from=${from}&to=${to}`).pipe(
      map(res=>res)
    )
  }

  addUser(value):Observable<any>{
    return this.http.post(`/api/user/internal-user`,value).pipe(
      map(res=>res)
    )
  }
  editUser(value,userId):Observable<any>{
    return this.http.put(`/api/user/internal-user/${userId}`,value).pipe(
      map(res=>res)
    )
  }

  deleteUser(userId):Observable<any>{
    return this.http.delete(`/api/user/internal-user/${userId}`).pipe(
      map(res=>res)
    )
  }
}
