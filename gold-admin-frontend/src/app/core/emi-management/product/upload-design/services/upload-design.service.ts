import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINT } from '../../../../../app.constant';
@Injectable({
  providedIn: 'root'
})
export class UploadDesignService {

  constructor(private http: HttpClient) { }

  uploadMultipleImages(data): Observable<any> {
    return this.http.post<any>(API_ENDPOINT + `api/bulk-image-upload`, data);
  }
}
