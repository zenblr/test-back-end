import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataTableService {

  searchInput: Subject<any> = new Subject<any>();
  searchInput$ = this.searchInput.asObservable();

  topBarCheck: Subject<any> = new BehaviorSubject<any>(false);
  topBarCheck$ = this.topBarCheck.asObservable();

  constructor() { }
}
