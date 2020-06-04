import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class PurposeService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(
    public http:HttpClient,
    public toastr:ToastrService,
    ) { }

  getpacketsTrackingDetails(from, to, search):Observable <any>{
    return this.http.get(`/api/?search=${search}&from=${from}&to=${to}`).pipe(
      map(res=>res),
      catchError(err => {
        this.toastr.error(err.error.message);
        throw (err);
      }))
  }
}
