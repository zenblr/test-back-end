import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class JewelleryReleaseService {

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  getPartReleaseInfo(id) {
    return this.http.get(` /api/jewellery-release/${id}`).pipe(map(res => res),
      catchError(err => {
        if (err.error.message) {
          this.toastr.error(err.error.message)
        }
        throw (err)
      }))
  }

  getFullReleaseInfo(id) {
    return this.http.get(`api/part-release/${id}`).pipe(map(res => res),
      catchError(err => {
        if (err.error.message) {
          this.toastr.error(err.error.message)
        }
        throw (err)
      }))
  }

  partReleaseOrnaments(ornaments) {
    return this.http.post(`/api/jewellery-release`, ornaments).pipe(map(res => res),
      catchError(err => {
        if (err.error.message) {
          this.toastr.error(err.error.message)
        }
        throw (err)
      }))
  }

  partReleasePayment(ornaments) {
    return this.http.post(`/api/jewellery-release/part-release`, ornaments).pipe(map(res => res),
      catchError(err => {
        if (err.error.message) {
          this.toastr.error(err.error.message)
        }
        throw (err)
      }))
  }
}
