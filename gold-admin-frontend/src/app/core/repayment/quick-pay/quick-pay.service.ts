import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QuickPayService {

  constructor(private http:HttpClient) { }

  interestInfo(id):Observable<any>{
    return this.http.get(`/api/quick-pay/interest-info?masterLoanId=${id}`).pipe(
      map(res=> res)
    )
  }
}
