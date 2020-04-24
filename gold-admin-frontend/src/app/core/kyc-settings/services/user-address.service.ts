import { Injectable, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ToastrComponent } from '../../../views/partials/components';

@Injectable({
  providedIn: 'root'
})
export class UserAddressService {

  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent
  constructor(private http: HttpClient) { }

  getIdentityType(): Observable<any> {
    return this.http.get(`/api/identity-type`).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.errorToastr(err.error.message);
        throw (err)
      }))
  }

  getAddressProofType(): Observable<any> {
    return this.http.get(`/api/address-proof-type`).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.errorToastr(err.error.message);
        throw (err)
      }))
  }

}
