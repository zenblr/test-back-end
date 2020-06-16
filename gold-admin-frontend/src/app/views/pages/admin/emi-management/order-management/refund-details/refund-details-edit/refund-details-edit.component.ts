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
import { map, catchError } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { ToastrComponent } from "../../../../../../partials/components";
import { SharedService } from "../../../../../../../core/shared/services/shared.service";
import {
	RefundDetailsDatasource,
	RefundDetailsModel,
	RefundDetailsService,
} from "../../../../../../../core/emi-management/order-management";
import { DatePipe } from '@angular/common';

@Component({
	selector: "kt-refund-details-edit",
	templateUrl: "./refund-details-edit.component.html",
	styleUrls: ["./refund-details-edit.component.scss"],
	providers: [DatePipe]
})
export class RefundDetailsEditComponent implements OnInit {
	@ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
	refundForm: FormGroup;
	refundId: number;
	refundData: any;
	viewLoading = false;
	title: string;
	isMandatory = false;
	showUploadFile = false;
	showUploadedFile = false;
	hiddenFlag = true;
	constructor(
		public dialogRef: MatDialogRef<RefundDetailsEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private refundDetailsService: RefundDetailsService,
		private ref: ChangeDetectorRef,
		private fb: FormBuilder,
		private sharedService: SharedService,
		private route: ActivatedRoute,
		private toast: ToastrService,
		private router: Router,
		private datePipe: DatePipe
	) { }

	ngOnInit() {
		this.formInitialize();
		this.refundId = this.route.snapshot.params.id;
		if (this.refundId) {
			this.refundDetailsService
				.getSingleRefund(this.refundId)
				.pipe(
					map((res) => {
						this.refundData = res;
						this.editRefund();
						this.ref.detectChanges();
					})
				)
				.subscribe();
		}
	}

	formInitialize() {
		this.refundForm = this.fb.group({
			storeId: [""],
			userId: [""],
			customerName: [""],
			mobileNumber: [""],
			orderId: [""],
			bookingPrice: [""],
			totalAmt: [""],
			cancelPrice: [""],
			diffAmt: [""],
			cancelFees: [""],
			CancelCharge: [""],
			totalCancelCharge: [""],
			amtPayable: [""],
			cancelDate: [""],
			bankName: [""],
			acNumber: [""],
			ifscCode: [""],
			cancelOrder: [""],
			utrNumber: ["", Validators.required],
			status: ["", Validators.required],
			passbookCopy: [""],
			checkCopy: [""],
		});
		this.refundForm.valueChanges.subscribe((val) => console.log(val));
	}

	get controls() {
		if (this.refundForm) return this.refundForm.controls;
	}

	editRefund() {
		const data = {
			storeId: this.refundData.order.orderBy.broker.store.storeUniqueId,
			userId: this.refundData.order.customerDetails.customerUniqueId,
			customerName: this.refundData.order.customerDetails.firstName,
			mobileNumber: this.refundData.order.customerDetails.mobileNumber,
			orderId: this.refundData.order.orderUniqueId,
			bookingPrice: this.refundData.cancelOrder.totalPrice,
			totalAmt: this.refundData.cancelOrder.totalAmountPaid,
			cancelPrice: this.refundData.cancelOrder.productUpdatedPrice,
			diffAmt: this.refundData.cancelOrder.diffrenceAmount,
			cancelFees: this.refundData.cancelOrder.cancelationFees,
			CancelCharge: this.refundData.cancelOrder.cancellationCharges,
			totalCancelCharge: this.refundData.cancelOrder.totalCancelationCharges,
			amtPayable: this.refundData.cancelOrder.payableToCustomer,
			cancelDate: this.datePipe.transform(new Date(this.refundData.cancelOrder.cancelDate), 'MMM d, y hh:mm a'),
			bankName: this.refundData.customerBankName,
			acNumber: this.refundData.customerAccountNo,
			ifscCode: this.refundData.ifscCode,
			cancelOrder: this.refundData.order.orderBy.broker.merchant
				.merchantName,
			utrNumber: this.refundData.transactionId,
		};
		this.refundForm.patchValue(data);

		if (this.refundData.passbookCopy && this.refundData.checkCopy) {
			this.showUploadedFile = true;
			this.showUploadFile = false;
		} else {
			this.showUploadedFile = false;
			this.showUploadFile = true;
		}

		if (this.refundData.refundStatus.id == 14) {
			this.refundForm.controls["utrNumber"].disable();
			this.hiddenFlag = false;
		} else {
			this.refundForm.controls["utrNumber"].enable();
			this.hiddenFlag = true;
		}
		this.ref.detectChanges();
	}

	uploadImage(data) {
		if (data.fieldName == "passbookCopy") {
			this.refundForm.controls["passbookCopy"].patchValue(
				data.uploadData.id
			);
		} else if (data.fieldName == "checkCopy") {
			this.refundForm.controls["checkCopy"].patchValue(
				data.uploadData.id
			);
		}
	}

	removeImage(data) {
		if (data.fieldName == "passbookCopy") {
			this.refundForm.controls["passbookCopy"].patchValue("");
		} else if (data.fieldName == "checkCopy") {
			this.refundForm.controls["checkCopy"].patchValue("");
		}
	}

	submit() {
		if (this.refundForm.invalid) {
			this.refundForm.markAllAsTouched();
			return;
		}
		console.log(this.refundForm.value);
		if (this.refundId) {
			const refundData = {
				transactionId: this.controls.utrNumber.value,
				statusId: this.controls.status.value
			};
			console.log(refundData);
			this.refundDetailsService
				.updateRefundStatus(refundData, this.refundId)
				.pipe(
					map((res) => {
						this.toastr.successToastr(
							"Refund Status Updated Sucessfully"
						);
						this.router.navigate([
							"/admin/emi-management/refund-details",
						]);
					}),
					catchError((err) => {
						this.toastr.errorToastr(err.error.message);
						throw err;
					})
				)
				.subscribe();
		}
	}
}
