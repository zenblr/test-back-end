import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const HttpUploadOptions = {
  headers: new HttpHeaders({ "Accept": "application/json" })
}

@Injectable({
  providedIn: 'root'
})

export class UploadBannerService {

  constructor(private http: HttpClient) { }


  uploadFile(fd): Observable<any> {
    console.log(fd);
    return this.http.post<any>(`/api/upload-file`, fd, HttpUploadOptions);
  }

  uploadBanners(fd): Observable<any> {
    return this.http.post<any>(`/api/banner/addbanner`, { images: fd });
  }

  getBanners(): Observable<any> {
    return this.http.get<any>(`/api/banner/readbanner`);
  }

  deleteBanner(id): Observable<any> {
    return this.http.delete<any>(`/api/banner/deletebanner/${id}`);

  }
}
