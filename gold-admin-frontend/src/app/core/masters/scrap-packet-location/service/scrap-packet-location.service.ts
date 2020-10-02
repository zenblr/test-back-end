import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ScrapPacketLocationService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(
    public http: HttpClient,
    public toastr: ToastrService,
  ) { }

  getScrapPacketsTrackingDetails(from, to, search): Observable<any> {
    return this.http.get(`/api/scrap/scrap-packet-location?search=${search}&from=${from}&to=${to}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      }))
  }

  addpacketLocation(location): Observable<any> {
    return this.http.post<any>(`/api/packet-location`, { location }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  updatepacketLocation(id, location): Observable<any> {
    return this.http.put<any>(`/api/packet-location/${id}`, { location }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }

  deletepacketLocation(id): Observable<any> {
    return this.http.delete<any>(`/api/packet-location?id=${id}&isActive=false`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }
}
