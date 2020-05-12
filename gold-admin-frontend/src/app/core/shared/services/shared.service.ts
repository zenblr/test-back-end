import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  totalCount = new BehaviorSubject(0);
  totalCount$ = this.totalCount.asObservable()
  role = new BehaviorSubject(undefined)
  role$ = this.role.asObservable();

  constructor(private http: HttpClient) {
    var token = localStorage.getItem('accessToken');
    var decodedValue = JSON.parse(atob(token.split('.')[1]));
    this.role.next(decodedValue.roleName[0]);
    console.log(this.role);
  }

  getStates(): Observable<any> {
    return this.http.get(`/api/state`);
  }

  getCities(id): Observable<any> {
    return this.http.get(`/api/city/${id}`);
  }

  uploadFile(files): Observable<any> {
    var fd = new FormData()
    fd.append('avatar', files)
    return this.http.post<any>(`/api/upload-file`, fd);
  }
}
