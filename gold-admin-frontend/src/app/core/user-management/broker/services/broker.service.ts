import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class BrokerService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();
  constructor() { }
  
}
