import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrderDetailsService {

  constructor(private http: HttpClient) { }

  getAllOrderDetails(from?, to?, search?): Observable<any> {
    return this.http
      .get<any>(`http://173.249.49.7:9120/api/order?search=${search}&from=${from}&to=${to}`, { observe: 'response' })
      .pipe(map(response => response.body));
  }

  getOrderTrackingLog(id): Observable<any> {
    return this.http
      .get<any>(`http://173.249.49.7:9120/api/order/order-tracking-log/${id}`, { observe: 'response' })
      .pipe(map(response => response.body));
  }
}
