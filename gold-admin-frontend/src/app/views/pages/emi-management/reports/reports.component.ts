import {
	Component,
	OnInit,
	Inject,
	Output,
	EventEmitter,
	ChangeDetectorRef,
	ViewChild,
	Input,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { map, catchError } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { ToastrComponent } from "../../../../views/partials/components";
import { SharedService } from "../../../../core/shared/services/shared.service";
import { ReportsService } from "../../../../core/emi-management/reports/services/reports.service";
import { NgxPermissionsService } from "ngx-permissions";

@Component({
	selector: "kt-reports",
	templateUrl: "./reports.component.html",
	styleUrls: ["./reports.component.scss"],
})
export class ReportsComponent implements OnInit {
	reportForm: FormGroup;
	reportTypes = [];
	minDate = new Date();
	merchantList = [];
	orderStatusList = [];
	@Output() next: EventEmitter<any> = new EventEmitter<any>();
	@ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;

	constructor(
		private reportsService: ReportsService,
		private fb: FormBuilder,
		private sharedService: SharedService,
		private ref: ChangeDetectorRef,
		private route: ActivatedRoute,
		private toast: ToastrService,
		private router: Router,
		private ngxPermissionService: NgxPermissionsService
	) {}

	ngOnInit() {
		this.ngxPermissionService.permissions$.subscribe((res) => {
			if (res) {
				console.log(res);
				this.reportTypes = [
					{ id: 1, name: "User Report", permission: res.userReport },
					{
						id: 2,
						name: "Deposit Report",
						permission: res.depositReport,
					},
					{ id: 3, name: "EMI Report", permission: res.EMIReport },
					{
						id: 4,
						name: "Order Report",
						permission: res.orderReport,
					},
					{
						id: 5,
						name: "Order Cancel Report",
						permission: res.cancelOrderReport,
					},
					{
						id: 7,
						name: "Products Report",
						permission: res.productsReport,
					},
					{
						id: 8,
						name: "Franchise Report",
						permission: res.franchiseReport,
					},
				];
			}
		});

		this.formInitialize();
		this.getMerchant();
		this.getOrderStatus();
	}

	formInitialize() {
		this.reportForm = this.fb.group({
			reportType: ["", Validators.required],
			startDate: ["", Validators.required],
			endDate: ["", Validators.required],
			merchantId: [""],
			statusId: [""],
		});
		this.setReportTypeValidators();

		this.reportForm.valueChanges.subscribe((val) => console.log(val));
	}

	get controls() {
		if (this.reportForm) return this.reportForm.controls;
	}

	getMerchant() {
		this.sharedService.getMerchant().subscribe((res) => {
			this.merchantList = res;
		});
	}

	getOrderStatus() {
		this.sharedService.getOrderStatus().subscribe((res) => {
			this.orderStatusList = res;
		});
	}

	setReportTypeValidators() {
		const merchantIdControl = this.reportForm.get("merchantId");
		const statusIdControl = this.reportForm.get("statusId");

		this.reportForm.get("reportType").valueChanges.subscribe((val) => {
			if (
				val == "1" ||
				val == "2" ||
				val == "3" ||
				val == "4" ||
				val == "5"
			) {
				merchantIdControl.setValidators([Validators.required]);
			} else {
				merchantIdControl.setValidators([]);
			}
			if (val == "4") {
				statusIdControl.setValidators([Validators.required]);
			} else {
				statusIdControl.setValidators([]);
			}
			merchantIdControl.updateValueAndValidity();
			statusIdControl.updateValueAndValidity();
		});
	}

	submit() {
		if (this.reportForm.invalid) {
			this.reportForm.markAllAsTouched();
			return;
		}
		let startDate = new Date(this.controls.startDate.value);
		let sd = new Date(
			startDate.getTime() - startDate.getTimezoneOffset() * 60000
		).toISOString();

		let endDate = new Date(this.controls.endDate.value);
		let ed = new Date(
			endDate.getTime() - endDate.getTimezoneOffset() * 60000
		).toISOString();
		const reportData = {
			merchantId: this.controls.merchantId.value,
			statusId: this.controls.statusId.value,
			startDate: sd,
			endDate: ed,
		};
		console.log(reportData);
		if (this.controls.reportType.value == 1) {
			this.reportsService.getUserReport(reportData).subscribe();
		} else if (this.controls.reportType.value == 2) {
			this.reportsService.getDepositReport(reportData).subscribe();
		} else if (this.controls.reportType.value == 3) {
			this.reportsService.getEmiReport(reportData).subscribe();
		} else if (this.controls.reportType.value == 4) {
			this.reportsService.getOrderReport(reportData).subscribe();
		} else if (this.controls.reportType.value == 5) {
			this.reportsService.getCancelReport(reportData).subscribe();
		} else if (this.controls.reportType.value == 7) {
			this.reportsService.getProductReport(reportData).subscribe();
		} else if (this.controls.reportType.value == 8) {
			this.reportsService.getFranchiseReport(reportData).subscribe();
		}
	}
}
