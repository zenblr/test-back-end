import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PartnerService {

  constructor(private http: HttpClient) { }

  addPartner(data): Observable<any> {
    return this.http.post<any>(`/api/partner/addpartner`, data);
  }

  getPartner(): Observable<any> {
    return this.http.get<any>(`/api/partner/readpartner`);
  }

  getPartnerById(id): Observable<any> {
    return this.http.get<any>(`/api/partner/readpartnerbyid/${id}`);
  }

  updatePartner(id, data): Observable<any> {
    return this.http.get<any>(`/api/partner/updatepartner/${id}`, data);
  }

  deletePartner(data): Observable<any> {
    return this.http.delete<any>(`/api/partner/deletepartner/${data}`);
  }
}
