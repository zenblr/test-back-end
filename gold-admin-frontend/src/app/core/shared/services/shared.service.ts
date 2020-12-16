import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject, of } from "rxjs";
import { API_ENDPOINT } from '../../../app.constant';
import { map, tap } from 'rxjs/operators';
import { ExcelService } from '../../_base/crud/services/excel.service';
import { ToastrService } from 'ngx-toastr';

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

	exportExcel = new BehaviorSubject<any>(false);
	exportExcel$ = this.exportExcel.asObservable();

	isSubHeaderVisible = new BehaviorSubject<boolean>(false);
	isSubHeaderVisible$ = this.isSubHeaderVisible.asObservable();

	hideLoader = new BehaviorSubject(false);
	hideLoader$ = this.hideLoader.asObservable()

	appraiserOrCCE = [
		{ value: 'pending', name: 'pending' },
		{ value: 'approved', name: 'approved' },
		{ value: 'rejected', name: 'rejected' }
	];
	appraiserOrCCEScrap = [
		{ value: 'pending', name: 'pending' },
		{ value: 'approved', name: 'approved' },
		{ value: 'rejected', name: 'rejected' },
	];
	branchManagerScrap = [
		{ value: 'incomplete', name: 'incomplete' },
		{ value: 'approved', name: 'approved' },
		{ value: 'rejected', name: 'rejected' },
	];
	branchManagerLoan = [
		{ value: 'incomplete', name: 'incomplete' },
		{ value: 'approved', name: 'approved' },
		{ value: 'rejected', name: 'rejected' },
	];
	branchManagerLoanFilter = [
		{ value: 'pending', name: 'pending' },
		{ value: 'incomplete', name: 'incomplete' },
		{ value: 'approved', name: 'approved' },
		{ value: 'rejected', name: 'rejected' },
	];

	product = [
		{ name: 'loan', value: 'loan' },
		{ name: 'emi', value: 'emi' }
	]

	cronStatus = [
		{ name: 'failed', value: 'failed' },
		{ name: 'success', value: 'success' }
	]

	cronType = [
		{ name: 'loan Penal Interest', value: 'loan Penal Interest' },
		{ name: 'loan Interest', value: 'loan Interest' },
		{ name: 'cancel order data transfer', value: 'cancel order data transfer' },
		{ name: 'deposit data transfer', value: 'deposit data transfer' },
		{ name: 'user data transfer', value: 'user data transfer' },
		{ name: 'order data transfer', value: 'order data transfer' },
		{ name: 'order status to defaulter', value: 'order status to defaulter' },
		{ name: 'emi reminder', value: 'emi reminder' }

	]

	userManagementPermission = [
		'partnerView',
		'partnerBranchView',
		'internalUserView',
		'internalBranchView',
		'merchantView',
		'brokerView',
		'storeView',
		'concurrentLoginView'
	]

	constructor(
		private http: HttpClient,
		private excelService: ExcelService,
		private toastr: ToastrService) { }

	getStatus() {
		return of({ apprsiserOrCCE: this.appraiserOrCCE, appraiserOrCCEScrap: this.appraiserOrCCEScrap, bm: this.branchManagerScrap, bml: this.branchManagerLoan, bmlfilter: this.branchManagerLoanFilter })
	}

	getScrapStatus(): Observable<any> {
		return this.http.get(`/api/scrap/scrap-process/get-scrap-status`);
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
		if (data && data.masterLoanId) {
			reqParams.loanId = data.masterLoanId;
		}
		if (data && data.scrapId) {
			reqParams.scrapId = data.scrapId;
		}
		if (data && data.partReleaseId) {
			reqParams.partReleaseId = data.partReleaseId;
		}
		if (data && data.fullReleaseId) {
			reqParams.fullReleaseId = data.fullReleaseId;
		}
		var fd = new FormData();
		fd.append("avatar", files);
		return this.http.post<any>(`/api/upload-file`, fd, { params: reqParams });
	}

	uploadBase64File(avatar, data?): Observable<any> {
		const reqParams: any = {};
		if (data && data.reason) {
			reqParams.reason = data.reason;
		}
		if (data && data.customerId) {
			reqParams.customerId = data.customerId;
		}
		if (data && data.masterLoanId) {
			reqParams.loanId = data.masterLoanId;
		}
		if (data && data.scrapId) {
			reqParams.scrapId = data.scrapId;
		}
		return this.http.post<any>(`/api/upload-file/base`, { avatar }, { params: reqParams });
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

	getTokenDecode(): Observable<any> {
		let token = localStorage.getItem("UserDetails");
		if (token) {
			let decodedValue = JSON.parse(atob(token.split(".")[1]));
			return of(decodedValue);
		}
	}

	//  for quick pay and part payment 
	paymentGateWay(amount, masterLoanId): Observable<any> {
		return this.http.post(`api/quick-pay/razor-pay`, { amount, masterLoanId }).pipe(
			map(res => res)
		)
	}

	//  for quick pay and part payment 
	paymentGateWayForFullAndPart(masterLoanId, ornamentId): Observable<any> {
		return this.http.post(`api/jewellery-release/razor-pay`, { masterLoanId, ornamentId }).pipe(
			map(res => res)
		)
	}


	soaDownload(masterLoanId): Observable<any> {
		let endDate = ""
		let startDate = ""
		return this.http.post(`api/loan-soa`, { masterLoanId, startDate, endDate }, { responseType: "arraybuffer" }).pipe(
			map((res) => {
				return res;
			}),
			tap(
				(data) => {
					this.excelService.saveAsExcelFile(
						data,
						"S.O.A_" + Date.now());
				},
				(error) => console.log(error)
			)
		);
	}

	fileValidator(event, type = null) {
		let validFormats = ['jpg', 'jpeg', 'png', 'pdf']
		if (type && type == 'pdf') {
			validFormats = validFormats.filter(format => format === 'pdf')
		}
		if (type && type == 'image') {
			validFormats = validFormats.filter(format => format !== 'pdf')
		}
		const name = event.target.files[0].name
		const split = name.split('.')
		const ext = (split[split.length - 1]).toLowerCase()
		const isValid = validFormats.some(e => e === ext)
		if (isValid) {
			return true
		} else {
			this.toastr.error('Upload Valid File Format')
			return false
		}
	}

	getExtension(name): string {
		const split = name.split('.')
		const ext = (split[split.length - 1]).toLowerCase()
		return ext
	}

	getCronProduct() {
		return this.product
	}

	getCronStatus() {
		return this.cronStatus
	}

	getCronType() {
		return this.cronType
	}

	getUserManagmentPermission() {
		return this.userManagementPermission
	}

	getModulePoints(): Observable<any> {
		return this.http.get(`/api/modules`);
	}

}
