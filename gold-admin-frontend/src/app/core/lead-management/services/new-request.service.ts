import { Injectable } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NewRequestService {

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  newRequestAdd(data): Observable<any> {
    return this.http.post<any>(`/api/lead-new-request`, data).pipe(map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message)
        throw (err)
      })
    );
  }

  getNewRequests(data): Observable<any> {
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

    return this.http.get<any>(`api/lead-new-request/view-all`, { params: reqParams })
      .pipe(map(res => res),
        catchError(err => {
          if (err.error.message) this.toastr.error(err.error.message)
          throw (err)
        })
      );
  }

  newRequestUpdate({ id, ...data }): Observable<any> {
    return this.http.put<any>(`/api/lead-new-request/${id}`, data).pipe(map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message)
        throw (err)
      })
    );
  }

  getMyRequests(data): Observable<any> {
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

    return this.http.get<any>(`/api/lead-new-request/my-request`, { params: reqParams })
      .pipe(map(res => res),
        catchError(err => {
          if (err.error.message) this.toastr.error(err.error.message)
          throw (err)
        })
      );
  }

  newRequestAssignAppraiser({ id, ...data }): Observable<any> {
    return this.http.put<any>(`/api/lead-new-request/assign-appraiser/${id}`, data)
      .pipe(map(res => res),
        catchError(err => {
          if (err.error.message) this.toastr.error(err.error.message)
          throw (err)
        })
      );
  }
}
