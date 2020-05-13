import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadDesignService {

  constructor(private http: HttpClient) { }

  uploadMultipleImages(data): Observable<any> {
    return this.http.post<any>(`/api/bulk-image-upload`, data);
  }
}
