import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MyPacketsService {

  constructor(public http: HttpClient, private toastr: ToastrService) { }

  getpackets(search, from, to): Observable<any> {
    return this.http.get(`/api/packet-tracking/tracking-details?search=${search}&from=${from}&to=${to}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }
}
