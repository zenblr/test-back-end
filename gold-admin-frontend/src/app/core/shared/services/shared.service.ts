import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject, of } from "rxjs";

@Injectable({
	providedIn: "root",
})
export class SharedService {
	totalCount = new BehaviorSubject(0);
	totalCount$ = this.totalCount.asObservable()
	role = new BehaviorSubject(null)
	role$ = this.role.asObservable();
	closeFilter = new BehaviorSubject<any>(false);
	closeFilter$ = this.closeFilter.asObservable();

	constructor(private http: HttpClient) {
		var token = localStorage.getItem("UserDetails");
		if (token) {
			var decodedValue = JSON.parse(atob(token.split(".")[1]));
			this.role.next(decodedValue.roleName[0]);
			console.log(this.role);
		}
	}

	getStates(): Observable<any> {
		return this.http.get(`/api/state`);
	}

	getCities(id): Observable<any> {
		return this.http.get(`/api/city/${id}`);
	}

	uploadFile(files): Observable<any> {
		var fd = new FormData();
		fd.append("avatar", files);
		return this.http.post<any>(`/api/upload-file`, fd);
	}

	getRole(): Observable<any> {
		var token = localStorage.getItem("UserDetails");
		// if (token) {
		var decodedValue = JSON.parse(atob(token.split(".")[1]));
		return of(decodedValue.roleName[0]);
		console.log(this.role);
		// }
	}

	fileUpload(data): Observable<any> {
		return this.http.post<any>(
			`http://173.249.49.7:9120/api/file-upload`,
			data
		);
	}

	getAllCategory(): Observable<any> {
		return this.http.get<any>(
			`http://173.249.49.7:9120/api/category/all-category`
		);
	}

	getAllSubCategory(): Observable<any> {
		return this.http.get<any>(`http://173.249.49.7:9120/api/sub-category/all-subcategory`);
	}

	getTenure(): Observable<any> {
		return this.http.get<any>(`http://173.249.49.7:9120/api/payment-type`);
	}

	getOrderStatus(): Observable<any> {
		return this.http.get<any>(
			`http://173.249.49.7:9120/api/order/all-order-status`
		);
	}

	getEmiStatus(): Observable<any> {
		return this.http.get<any>(
			`http://173.249.49.7:9120/api/emi-details/all-emi-status`
		);
	}

	getMerchant(): Observable<any> {
		return this.http.get<any>(
			`http://173.249.49.7:9120/api/merchant/all-merchant`
		);
	}

	getDataFromStorage() {
		return JSON.parse(localStorage.getItem('UserDetails'));
	}

	getUserDetailsFromStorage(): Observable<any> {
		const details = JSON.parse(localStorage.getItem('UserDetails'));
		if (details) {
			return of(details);
		}
	}
}
