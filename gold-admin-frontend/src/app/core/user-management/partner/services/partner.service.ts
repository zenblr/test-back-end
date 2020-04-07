import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PartnerService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(private http: HttpClient) { }

  addPartner(data): Observable<any> {
    return this.http.post<any>(`/api/partner`, data);
  }

  getAllPartner(from?, to?, fromDate?, text?, toDate?, userId?): Observable<any> {
    return this.http.get<any>(`/api/partner`);
  }

  getPartnerById(id): Observable<any> {
    return this.http.get<any>(`/api/partner/${id}`);
  }

  updatePartner(id, data): Observable<any> {
    return this.http.put<any>(`/api/partner/${id}`, data);
  }

  deletePartner(data): Observable<any> {
    return this.http.delete<any>(`/api/partner/${data}`);
  }
}
