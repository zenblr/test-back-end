import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  loader = new BehaviorSubject(false)
  loader$ = this.loader.asObservable();

  constructor(private http: HttpClient) { }

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
