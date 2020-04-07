import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoanSettingsService {

  constructor() { }

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();
}
