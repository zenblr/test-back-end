import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConcurrentUserLoginService {

  constructor(
    private http: HttpClient,
    private toast: ToastrService
  ) { }

  loadUser(search, from, to): Observable<any> {
    return this.http.get(`/api/user/concurrent-list?search=${search}&from=${from}&to=${to}`).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toast.error(err.error.message)

        throw err
      })
    )
  }

  remove(id):Observable<any>{
    return this.http.put(`/api/user/concurrent-list?id=${id}`,{}).pipe(
      map(res => res),
      catchError(err => {
        if (err.error.message)
          this.toast.error(err.error.message)

        throw err
      })
    )
  }
}
