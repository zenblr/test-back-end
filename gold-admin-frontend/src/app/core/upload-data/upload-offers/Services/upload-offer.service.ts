import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UploadOfferService {

  constructor(private http: HttpClient) { }


  uploadFile(fd): Observable<any> {
    return this.http.post<any>(`/api/upload-file`, fd).pipe(
      map(res => res));
  }

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