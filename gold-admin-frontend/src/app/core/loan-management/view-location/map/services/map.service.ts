import { Injectable } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(public http: HttpClient, private toastr: ToastrService) { }

  getMapReport(query): Observable<any> {
    return this.http.get(`/api/packet-tracking/map`, { params: query }).pipe(map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }
}
