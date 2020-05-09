import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppraiserService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();
  constructor() { }
}
