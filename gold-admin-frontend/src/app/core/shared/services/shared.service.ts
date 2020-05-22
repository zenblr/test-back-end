import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  totalCount = new BehaviorSubject(0);
  totalCount$ = this.totalCount.asObservable()
  role = new BehaviorSubject(null)
  role$ = this.role.asObservable();
  permission = new BehaviorSubject([]);
  permission$ = this.permission.asObservable();

  constructor(private http: HttpClient) {
    var token = JSON.parse(localStorage.getItem('UserDetails'));
    if (token) {
      var decodedValue = JSON.parse(atob(token.Token.split('.')[1]));
      this.role.next(decodedValue.roleName[0]);
      console.log(this.role);
    }
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

  getRole(): Observable<any> {
    var token = JSON.parse(localStorage.getItem('UserDetails'));
    if (token) {
      var decodedValue = JSON.parse(atob(token.Token.split('.')[1]));
      return of(decodedValue.roleName[0]);
    }
  }

  fileUpload(data): Observable<any> {
    return this.http.post<any>(`http://173.249.49.7:9120/api/file-upload`, data);
  }

  getAllCategory(): Observable<any> {
    return this.http.get<any>(`http://173.249.49.7:9120/api/category/all-category`);
  }

  getAllSubCategory(): Observable<any> {
    return this.http.get<any>(`http://173.249.49.7:9120/api/sub-category`);
  }

  getDataFromStorage() {
    return JSON.parse(localStorage.getItem('UserDetails'));
  }

  getPermission(): Observable<any> {
    const token = JSON.parse(localStorage.getItem('UserDetails'));
    if (token && token.permissions.length) {
      // console.log(token.permissions);
      return of(token.permissions);
    }
  }
}
