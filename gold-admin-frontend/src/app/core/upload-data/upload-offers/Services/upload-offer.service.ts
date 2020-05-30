import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class UploadOfferService {

  

  constructor(private http: HttpClient, private toastr: ToastrService) { }






  uploadOffers(fd): Observable<any> {
    return this.http.post<any>(`/api/offer`, { images: fd });
  }

  getOffers(): Observable<any> {
    return this.http.get<any>(`/api/offer`).pipe(
      map(res => res));
  }

  deleteOffers(id): Observable<any> {
    return this.http.delete<any>(`/api/banner/${id}`);

  }
}