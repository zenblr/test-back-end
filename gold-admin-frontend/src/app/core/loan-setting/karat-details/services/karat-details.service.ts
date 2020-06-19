import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class KaratDetailsService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();


  constructor(private http: HttpClient, private toast: ToastrService) { }

  addKaratDetails(data): Observable<any> {
    return this.http.post<any>(`/api/karat-details`, data)
      .pipe(
        map(
          res => res
          ), catchError(error => {
          this.toast.error(error.error.message);
          throw (error);
        })
      );
  }

  getAllKaratDetails(): Observable<any> {
    return this.http.get<any>(`/api/karat-details`).pipe(map(
      res => res
      
    ),
    catchError(error => {
      this.toast.error(error.error.message);
      throw (error);
    }));
  }

  // getAllLogisticPartnerWithoutPagination(search?, from?, to?): Observable<any> {
  //   return this.http.get<any>(`/api/logistic-partner/get-all-logistic-partner?&from=${1}&to=${-1}`);
  // }

  getKaratDetailsById(id): Observable<any> {
    return this.http.get<any>(`/api/karat-details/${id}`).pipe(map(res=>res),catchError(error => {
      this.toast.error(error.error.message);
      throw (error);
    }));
  }

  updateKaratDetails(id, data): Observable<any> {
    delete data.id
    return this.http.put<any>(`/api/karat-details/${id}`, data).pipe(
      map(
        res => res
      ), catchError(error => {
        this.toast.error(error.error.message);
        throw (error);
      })
    )
  }
  deleteKaratDetails(id): Observable<any> {
    return this.http.delete<any>(`/api/karat-details?id=${id}`).pipe(
      map(
        res => res
      ), catchError(error => {
        this.toast.error(error.error.message);
        throw (error);
      })
    );;

  }
}
