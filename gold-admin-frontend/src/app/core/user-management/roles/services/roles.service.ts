import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { RolesModel } from '../models/rolesmodel';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();
  roles = { desserts: [] }
  constructor() { }


  getRoles() {
    return this.roles
  }
}
