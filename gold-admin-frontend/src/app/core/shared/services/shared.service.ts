import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject, of } from "rxjs";
import { API_ENDPOINT } from '../../../app.constant';

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

	clearFilter = new BehaviorSubject<any>({});
	clearFilter$ = this.clearFilter.asObservable();

	appraiserOrCCE = [
		{ value: 'approved', name: 'approved' },
		{ value: 'pending', name: 'pending' },
		{ value: 'rejected', name: 'rejected' }
	];
	branchManager = [
		{ value: 'approved', name: 'approved' },
		{ value: 'rejected', name: 'rejected' },
		{ value: 'incomplete', name: 'incomplete' }
	];

	constructor(private http: HttpClient) { }

	getStatus() {
		return of({ apprsiserOrCCE: this.appraiserOrCCE, bm: this.branchManager })
	}

	getStates(): Observable<any> {
		return this.http.get(`/api/state`);
	}

	getCities(id): Observable<any> {
		return this.http.get(`/api/city?stateId=${id}`);
	}

	uploadFile(files, data?): Observable<any> {
		const reqParams: any = {};
		if (data && data.reason) {
			reqParams.reason = data.reason;
		}
		if (data && data.customerId) {
			reqParams.customerId = data.customerId;
		}
		var fd = new FormData();
		fd.append("avatar", files);
		return this.http.post<any>(`/api/upload-file`, fd, { params: reqParams });
	}

	uploadBase64File(avatar): Observable<any> {
		return this.http.post<any>(`/api/upload-file/base`, { avatar });
	}

	getRole(): Observable<any> {
		var token = localStorage.getItem("UserDetails");
		// if (token) {
		var decodedValue = JSON.parse(atob(token.split(".")[1]));
		return of(decodedValue.roleName[0]);
		console.log(this.role);
		// }
	}

	fileUpload(data, reason): Observable<any> {
		return this.http.post<any>(API_ENDPOINT + `api/file-upload?reason=` + reason, data);
	}

	getAllCategory(): Observable<any> {
		return this.http.get<any>(API_ENDPOINT + `api/category/all-category`);
	}

	getAllSubCategory(): Observable<any> {
		return this.http.get<any>(API_ENDPOINT + `api/sub-category/all-subcategory`);
	}

	getPaymentType(): Observable<any> {
		return this.http.get<any>(API_ENDPOINT + `api/payment-type`);
	}

	getOrderStatus(): Observable<any> {
		return this.http.get<any>(API_ENDPOINT + `api/order/all-order-status`);
	}

	getEmiStatus(): Observable<any> {
		return this.http.get<any>(API_ENDPOINT + `api/emi-details/all-emi-status`);
	}

	getLeadStatus(): Observable<any> {
		return this.http.get<any>(
			`/api/status`
		);
	}

	getMerchant(): Observable<any> {
		return this.http.get<any>(API_ENDPOINT + `api/merchant/all-merchant`);
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
