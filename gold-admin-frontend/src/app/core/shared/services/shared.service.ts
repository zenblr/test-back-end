import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(private http: HttpClient) { }

  getStates() {
    return this.http.get(`/api/state`);
  }

  getCities(id) {
    return this.http.get(`/api/city/${id}`);
  }
}
