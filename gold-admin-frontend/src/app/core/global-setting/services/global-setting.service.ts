import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GlobalSettingService {

  constructor(
    public toastr: ToastrService,
    public http: HttpClient) { }

  setGlobalSetting(params): Observable<any> {
    return this.http.post(`/api/gold-rate`, params.data).pipe(
      map(res => res),
      catchError(err => {
        this.toastr.error(err.error.message);
        throw (err);
      })
    )
  }
}
