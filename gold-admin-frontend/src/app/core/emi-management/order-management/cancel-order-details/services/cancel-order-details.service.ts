import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CancelOrderDetailsService {

  constructor(private http: HttpClient) { }

  getAllCancelOrderDetails(from?, to?, search?): Observable<any> {
    return this.http
      .get<any>(`http://173.249.49.7:9120/api/cancel-order?search=${search}&from=${from}&to=${to}`, { observe: 'response' })
      .pipe(map(response => response.body));
  }
}
