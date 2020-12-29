import { Injectable, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ToastrComponent } from '../../../views/partials/components';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class UserAddressService {

  // @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent
  constructor(private http: HttpClient, private toastr: ToastrService) { }

  getIdentityType(): Observable<any> {
    return this.http.get(`/api/identity-type`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err)
      }))
  }

  getAddressProofType(): Observable<any> {
    return this.http.get(`/api/address-proof-type`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err)
      }))
  }

  addressDetails(data): Observable<any> {
    return this.http.post(`/api/kyc/customer-kyc-address`, data).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err)
      }))
  }

  getAaddharDetails(fileUrls, customerId): Observable<any> {
    return this.http.post(`/api/e-kyc/ocr-aadhaar`, { fileUrls, customerId }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err)
      }))
  }

  getVoterIdDetails(fileUrls, customerId): Observable<any> {
    fileUrls = ['https://augmont-loan-prod.s3.ap-south-1.amazonaws.com/public/uploads/customer/2/WhatsApp+Image+2020-12-23+at+5.19.57+PM.jpeg',

      'https://augmont-loan-prod.s3.ap-south-1.amazonaws.com/public/uploads/customer/2/WhatsApp+Image+2020-12-23+at+5.20.08+PM.jpeg'
      
    ]
    return this.http.post(`/api/e-kyc/ocr-voter`, { fileUrls, customerId }).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err)
      }))
  }
}
