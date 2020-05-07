import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpUtilsService } from '../../../../core/_base/crud';

@Injectable({
  providedIn: 'root'
})
export class UploadDesignService {

  constructor(private http: HttpClient) { }

  uploadMultipleImages(data) {
    return this.http.post<any>(`http://173.249.49.7:9120/api/bulk-image-upload`, data);
  }
}
