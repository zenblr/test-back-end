import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DepositService {
  applyFilter = new BehaviorSubject<any>({});
  applyFilter$ = this.applyFilter.asObservable();

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

 

  constructor(public http: HttpClient, private toastr: ToastrService) { }

  getDepositList(data): Observable<any> {
    const reqParams: any = {};
    if (data && data.from) {
      reqParams.from = data.from;
    }
    if (data && data.to) {
      reqParams.to = data.to;
    }
    if (data && data.search) {
      reqParams.search = data.search;
    }
    if (data && data.depositStatus) {
      reqParams.depositStatus = data.depositStatus;
    }
    return this.http.get(`/api/deposit`,{ params: reqParams }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }

  editStatus(value,Id):Observable<any>{
    console.log(value)
    return this.http.put(`/api/deposit/${Id}`,{Status:value}).pipe(
      map(res=>res)
    )
  }
}
