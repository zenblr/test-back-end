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
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { map, catchError, takeUntil } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { ToastrComponent } from "../../../../../../views/partials/components";
import { SharedService } from "../../../../../../core/shared/services/shared.service";
import { OrderDetailsService } from "../../../../../../core/emi-management/order-management/order-details/services/order-details.service";
import { Subject } from "rxjs";

@Component({
	selector: "kt-order-details-edit",
	templateUrl: "./order-details-edit.component.html",
	styleUrls: ["./order-details-edit.component.scss"],
})
export class OrderDetailsEditComponent implements OnInit {
	viewLoading = false;
	orderForm: FormGroup;
	orderId: number;
	orderInfo: any;
	orderLogistic = [];
	hiddenFlag = false;
	showUploadFile = false;
	showUploadedFile = false;
	private destroy$ = new Subject();

	@Output() next: EventEmitter<any> = new EventEmitter<any>();
	@ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;

	constructor(
		public dialogRef: MatDialogRef<OrderDetailsEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private orderDetailsService: OrderDetailsService,
		private fb: FormBuilder,
		private sharedService: SharedService,
		private ref: ChangeDetectorRef,
		private route: ActivatedRoute,
		private toast: ToastrService,
		private router: Router
	) {
		this.orderDetailsService.buttonValue$
			.pipe(takeUntil(this.destroy$))
			.subscribe((res) => {
				if (Object.entries(res).length) {
					this.getPdf(res);
				}
			});
	}

	ngOnInit() {
		this.formInitialize();
		// this.getStates();
		// this.getStatus();
		this.orderId = this.route.snapshot.params.id;
		if (this.orderId) {
			this.orderDetailsService
				.getOrderDetails(this.orderId)
				.pipe(
					map((res) => {
						this.orderInfo = res;
						let paymentType = this.orderInfo.allOrderData
							.paymentType.paymentType;
						this.orderDetailsService.button.next(paymentType);
						this.editOrder();
					})
					// catchError(err => {
					//   this.toast.error(err.error.error);
					//   throw err;
					// })
				)
				.subscribe();
		}
	}

	formInitialize() {
		this.orderForm = this.fb.group({
			memberId: [""],
			orderId: [""],
			orderTotalAmount: [""],
			orderInitialAmount: [""],
			emiTenure: [""],
			productName: [""],
			sku: [""],
			emiStartDate: [""],
			emiEndDate: [""],
			logisticPartnerId: ["", Validators.required],
			trackingId: ["", Validators.required],
			statusId: ["", Validators.required],
			uploadedAwbFile: [""],
			uploadedAwbBox: [""],
		});
		this.setAwbValidators();

		this.orderForm.valueChanges.subscribe((val) => console.log(val));
	}

	get controls() {
		if (this.orderForm) return this.orderForm.controls;
	}

	editOrder() {
		console.log(this.orderInfo);
		const data = {
			memberId: this.orderInfo.allOrderData.customerDetails
				.customerUniqueId,
			orderId: this.orderInfo.allOrderData.orderUniqueId,
			orderTotalAmount: this.orderInfo.allOrderData.orderdetails[0]
				.finalOrderPrice,
			orderInitialAmount: this.orderInfo.allOrderData.orderdetails[0]
				.initialPayment,
			emiTenure: this.orderInfo.allOrderData.paymentType.paymentType,
			productName: this.orderInfo.allOrderData.product.productName,
			sku: this.orderInfo.allOrderData.product.sku,
			emiStartDate: this.orderInfo.emiStartDate,
			emiEndDate: this.orderInfo.emiLastDate,
		};
		this.orderForm.patchValue(data);

		if (
			this.orderInfo.trackingDetails &&
			this.orderInfo.trackingDetails.trackingId
		) {
			this.orderForm.controls["trackingId"].patchValue(
				this.orderInfo.trackingDetails.trackingId
			);
		}
		if (
			this.orderInfo.trackingDetails &&
			this.orderInfo.trackingDetails.logisticPartnerId
		) {
			this.orderForm.controls["logisticPartnerId"].patchValue(
				this.orderInfo.trackingDetails.logisticPartnerId
			);
		}

		switch (this.orderInfo.currentStatus.statusId) {
			case 5:
			case 7:
				this.hiddenFlag = true;
				this.getOrderLogistic();
				break;
			case 8:
				this.showUploadedFile = true;
				this.getOrderLogistic();
				this.orderForm.disable();
				break;
			case 6:
			case 11:
			case 12:
				this.hiddenFlag = true;
				this.getOrderLogistic();
				this.orderForm.controls["trackingId"].disable();
				this.orderForm.controls["logisticPartnerId"].disable();
				break;
			default:
				this.hiddenFlag = false;
				this.orderForm.disable();
				break;
		}
		this.ref.detectChanges();
	}

	getOrderLogistic() {
		this.orderDetailsService.getOrderLogistic().subscribe((res) => {
			this.orderLogistic = res;
			this.ref.detectChanges();
		});
	}

	uploadImage(data) {
		if (data.fieldName == "uploadedAwbFile") {
			this.orderForm.controls["uploadedAwbFile"].patchValue(
				data.uploadData.id
			);
		} else if (data.fieldName == "uploadedAwbBox") {
			this.orderForm.controls["uploadedAwbBox"].patchValue(
				data.uploadData.id
			);
		}
	}

	removeImage(data) {
		if (data.fieldName == "uploadedAwbFile") {
			this.orderForm.controls["uploadedAwbFile"].patchValue("");
		} else if (data.fieldName == "uploadedAwbBox") {
			this.orderForm.controls["uploadedAwbBox"].patchValue("");
		}
	}

	setAwbValidators() {
		const uploadedAwbFileControl = this.orderForm.get("uploadedAwbFile");
		const uploadedAwbBoxControl = this.orderForm.get("uploadedAwbBox");

		this.orderForm.get("statusId").valueChanges.subscribe((val) => {
			if (val == "8") {
				this.showUploadFile = true;
				uploadedAwbFileControl.setValidators([Validators.required]);
				uploadedAwbBoxControl.setValidators([Validators.required]);
			} else {
				uploadedAwbFileControl.setValidators([]);
				uploadedAwbBoxControl.setValidators([]);
			}
			uploadedAwbFileControl.updateValueAndValidity();
			uploadedAwbBoxControl.updateValueAndValidity();
		});
	}

	submit() {
		if (this.orderForm.invalid) {
			this.orderForm.markAllAsTouched();
			return;
		}
		console.log(this.orderForm.value);
		if (this.orderId) {
			const orderData = {
				logisticPartnerId: this.controls.logisticPartnerId.value,
				statusId: this.controls.statusId.value,
				trackingId: this.controls.trackingId.value,
				uploadedAwbBox: this.controls.uploadedAwbBox.value,
				uploadedAwbFile: this.controls.uploadedAwbFile.value,
			};
			console.log(orderData);
			this.orderDetailsService
				.editOrderStatus(orderData, this.orderId)
				.pipe(
					map((res) => {
						this.toastr.successToastr(
							"Order Status Updated Sucessfully"
						);
						this.router.navigate(["/emi-management/order-details"]);
					}),
					catchError((err) => {
						this.toastr.errorToastr(err.error.message);
						throw err;
					})
				)
				.subscribe();
		}
	}

	getPdf(value) {
		if (value == "Print Performa") {
			this.orderDetailsService.getPerforma(this.orderId).subscribe();
		} else if (value == "Contract") {
			this.orderDetailsService.getContract(this.orderId).subscribe();
		}
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
		this.orderDetailsService.buttonValue.next({});
		this.orderDetailsService.button.next({});
		this.sharedService.closeFilter.next(true);
	}
}
