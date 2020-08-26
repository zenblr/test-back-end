import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UpdateLocationService {

  constructor(public http: HttpClient, private toastr: ToastrService) { }

  getDetailsByMobile(query): Observable<any> {
    return this.http.get(`/api/packet-tracking/user-name`, { params: query }).pipe(map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }
  sendCustomerOtp(mobileNumber:string): Observable<any> {
    return this.http.post<any>(`/api/customer/send-otp`,{mobileNumber} ); //mobile
  }

  addPacketLocation(data):Observable<any> {
    return this.http.post<any>(`/api/packet-tracking`, data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err);
      })
    );
  }
}
