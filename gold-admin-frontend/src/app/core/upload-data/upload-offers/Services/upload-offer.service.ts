import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UploadOfferService {

  goldRate = new BehaviorSubject<any>(0);
  goldRate$ = this.goldRate.asObservable();

  constructor(private http: HttpClient) { }




  uploadOffers(goldRate, fd): Observable<any> {
    return this.http.post<any>(`/api/offer`, { goldRate, images: fd });
  }

  getOffers(): Observable<any> {
    return this.http.get<any>(`/api/offer`).pipe(
      map(res => res));
  }

  deleteOffers(id): Observable<any> {
    return this.http.delete<any>(`/api/banner/${id}`);

  }
}