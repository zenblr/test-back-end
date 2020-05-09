import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoanApplicationFormService {

  constructor(public http: HttpClient) { }

  customerDetails(id): Observable<any> {
    return this.http.get(`/api/loan-process/customer-loan-details/${id}`).pipe(
      map(res => res)
    )
  }

}
