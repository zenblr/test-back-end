import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LogisticPartnerService {
  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();


  constructor(private http: HttpClient,private toast:ToastrService) { }

  addLogisticPartner(data): Observable<any> {
    return this.http.post<any>(`/api/logistic-partner`, data)
    .pipe(
      map(
      res=>res
    ),catchError(error=>{
      this.toast.error(error.error.message);
      throw(error); 
    })
  );
  }

  getAllLogisticPartner(from, to,search): Observable<any> {
    return this.http.get<any>(`/api/logistic-partner?search=${search}&from=${from}&to=${to}`);
  }

  getAllLogisticPartnerWithoutPagination(search?, from?, to?): Observable<any> {
    return this.http.get<any>(`/api/logistic-partner/get-all-logistic-partner?&from=${1}&to=${-1}`);
  }

  getLogisticPartnerById(id): Observable<any> {
    return this.http.get<any>(`/api/logistic-partner/${id}`);
  }

  updateLogisticPartner(id, data): Observable<any> {
    delete data.id
    return this.http.put<any>(`/api/logistic-partner/${id}`, data).pipe(
      map(
      res=>res
    ),catchError(error=>{
      this.toast.error(error.error.message);
      throw(error); 
    })
  );;
  }

  deleteLogisticPartner(id): Observable<any> {
    return this.http.delete<any>(`/api/logistic-partner?id=${id}`).pipe(
      map(
      res=>res
    ),catchError(error=>{
      this.toast.error(error.error.message);
      throw(error); 
    })
  );;
  }}
