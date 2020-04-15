import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UploadLenderBannerService {

  constructor(private http: HttpClient) { }


  uploadFile(fd): Observable<any> {
    return this.http.post<any>(`/api/upload-file`, fd);
  }

  uploadLenderBanners(fd): Observable<any> {
    return this.http.post<any>(`/api/lender-banner`, { images: fd });
  }

  getLenderBanners(): Observable<any> {
    return this.http.get<any>(`/api/lender-banner`);
  }

  deleteBanner(id): Observable<any> {
    return this.http.delete<any>(`/api/banner/${id}`);

  }
}
