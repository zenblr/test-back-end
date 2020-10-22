import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class PartnerService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  addPartner(data): Observable<any> {
    return this.http.post<any>(`/api/partner`, data);
  }

  getAllPartner(search?, from?, to?, fromDate?, toDate?, userId?): Observable<any> {
    return this.http.get<any>(`/api/partner?search=${search}&from=${from}&to=${to}`).pipe(map(res => res),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message)
        throw (err)
      })
    )
  }

  getAllPartnerWithoutPagination(): Observable<any> {
    return this.http.get<any>(`/api/partner?&from=${1}&to=${-1}`);
  }

  getPartnerBySchemeAmount(amount): Observable<any> {
    return this.http.get<any>(`/api/scheme/partner-scheme-amount/${amount}`).pipe(
      map(res => res)
    )
  }

  getPartnerById(id): Observable<any> {
    return this.http.get<any>(`/api/partner/${id}`);
  }

  updatePartner(id, data): Observable<any> {
    delete data.id
    return this.http.put<any>(`/api/partner/${id}`, data);
  }

  deletePartner(id): Observable<any> {
    return this.http.delete<any>(`/api/partner?id=${id}&isActive=${false}`);
  }

  getSchemesByParnter(id): Observable<any> {
    return this.http.get(`/api/scheme/partner-scheme/${id}`).pipe(
      map(res => res)
    )
  }

  getUnsecuredSchemeByParnter(id, amount): Observable<any> {
    return this.http.get(`/api/scheme/unsecured-scheme/${id}/${amount}`).pipe(
      map(res => res)
    )
  }
}
