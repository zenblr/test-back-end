import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TopUpApprovalService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(public http: HttpClient, private toastr: ToastrService) { }

  getDepositList(from, to, search): Observable<any> {
    return this.http.get(`/api/deposit?search=${search}&from=${from}&to=${to}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }
}
