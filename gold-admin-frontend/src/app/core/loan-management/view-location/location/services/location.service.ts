import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(public http: HttpClient, private toastr: ToastrService) { }

  getLocation(data): Observable<any> {
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
    if (data && data.masterLoanId) {
      reqParams.masterLoanId = data.masterLoanId;
    }
    if (data && data.date) {
      reqParams.date = data.date;
    }
    return this.http.get(`/api/packet-tracking/location`, { params: reqParams }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }
}
