import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const HttpUploadOptions = {
  headers: new HttpHeaders({ "Content-type": "multipart/form-data" })
}

@Injectable({
  providedIn: 'root'
})

export class UploadBannerService {

  constructor(private http: HttpClient) { }


  uploadFile(fd): Observable<any> {
    return this.http.post<any>(`/api/upload-file`, fd);
  }

  uploadBanners(fd): Observable<any> {
    return this.http.post<any>(`/api/banner`, { images: fd });
  }

  getBanners(): Observable<any> {
    return this.http.get<any>(`/api/banner`);
  }

  deleteBanner(id): Observable<any> {
    return this.http.delete<any>(`/api/banner/${id}`);

  }
}
