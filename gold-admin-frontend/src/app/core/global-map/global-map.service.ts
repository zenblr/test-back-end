import { Injectable } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class GlobalMapService {

  constructor(
    public toastr: ToastrService,
    public http: HttpClient
  ) { }

  globalMapPacketInfo(date):Observable<any>{
    return this.http.get(`/api/packet-tracking/global-location-info?date=${date}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }

  globalMapInfo(date):Observable<any>{
    return this.http.get(`/api/packet-tracking/global-map-info?date=${date}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }


}
