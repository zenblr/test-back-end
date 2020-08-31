import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoanDetailsService {

  constructor(public http: HttpClient) { }

  getAllLoans(from, to, search): Observable<any> {
    return this.http.get(`/api/loan-process/loan-details?search=${search}&from=${from}&to=${to}`).pipe(
      map(res => res)
    )
  }

}
