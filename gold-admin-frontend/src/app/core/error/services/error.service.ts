import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(
    private http:HttpClient
  ) { }

  getErrorList(search,from,to):Observable<any>{
    return this.http.get(`/api/error-logs?from=${from}&to=${to}`)
  }
}
