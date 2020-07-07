import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoanTransferService {

  constructor(public http: HttpClient, private toastr: ToastrService) { }

  loadLoanTransferList(from, to, search) {
    return this.http.get(`/api/loan-process/loan-details?search=${search}&from=${from}&to${to}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message)
        throw (err)
      })
    );
  }
}
