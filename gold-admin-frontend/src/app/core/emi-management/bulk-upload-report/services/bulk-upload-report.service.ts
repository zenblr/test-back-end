import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BulkUploadReportService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor() { }

}
