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
import { ToastrComponent } from "../../../../../../partials/components";
import { SharedService } from "../../../../../../../core/shared/services/shared.service";
import { DepositRequestsService } from "../../../../../../../core/wallet/deposit-requests/deposit-requests.service";
import { Subject } from "rxjs";
@Component({
  selector: 'kt-deposit-requests-edit',
  templateUrl: './deposit-requests-edit.component.html',
  styleUrls: ['./deposit-requests-edit.component.scss']
})
export class DepositRequestsEditComponent implements OnInit {

  viewLoading = false;
	depositForm: FormGroup;
	depositId: number;
	depositInfo: any;
  depositStatus = [
		{ value: 'pending', name: 'Pending' },
    { value: 'completed', name: 'Completed' },
    { value: 'rejected', name: 'Rejected' },
  ];
	hiddenFlag = false;
	showUploadFile = false;
	showUploadedFile = false;
	private destroy$ = new Subject();

	@Output() next: EventEmitter<any> = new EventEmitter<any>();
	@ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;

	constructor(
		// public dialogRef: MatDialogRef<OrderDetailsEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private depositRequestsService: DepositRequestsService,
		private fb: FormBuilder,
		private sharedService: SharedService,
		private ref: ChangeDetectorRef,
		private route: ActivatedRoute,
		private toast: ToastrService,
		private router: Router
	) {
		// this.orderDetailsService.buttonValue$
		// 	.pipe(takeUntil(this.destroy$))
		// 	.subscribe((res) => {
		// 		if (Object.entries(res).length) {
		// 			this.getPdf(res);
		// 		}
		// 	});
	}

	ngOnInit() {
		this.formInitialize();
		// this.getStates();
		// this.getStatus();
		this.depositId = this.route.snapshot.params.id;
		if (this.depositId) {
			this.depositRequestsService.getDepositById(this.depositId)
				.pipe(
					map((res) => {
						this.depositInfo = res;
						// let paymentType = this.depositInfo.allOrderData
						// 	.paymentType.paymentType;
						// this.depositRequestsService.button.next(paymentType);
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
		this.depositForm = this.fb.group({
			bankTransactionID: [""],
			depositmodeofpayment: [""],
			depositBankName: [""],
			depositBranchName: [""],
			depositDate: [""],
			depositAmount: [""],
			depositStatus: [""],
		});
		// this.setAwbValidators();

		this.depositForm.valueChanges.subscribe((val) => console.log(val));
	}

	get controls() {
		if (this.depositForm) return this.depositForm.controls;
	}

	editOrder() {
		const data = {
			bankTransactionID: this.depositInfo.transactionData.bankTransactionUniqueId,
      depositmodeofpayment: this.depositInfo.transactionData.paymentType,
			depositBankName: this.depositInfo.transactionData.bankName,
      depositBranchName: this.depositInfo.transactionData.branchName,
        depositDate: this.depositInfo.transactionData.depositDate,
        // depositAmount: this.depositInfo.transactionData.transactionAmont,
        depositStatus: this.depositInfo.transactionData.depositStatus,
		
		};
		this.depositForm.patchValue(data);

		// if (
		// 	this.depositInfo.trackingDetails &&
		// 	this.depositInfo.trackingDetails.trackingId
		// ) {
		// 	this.depositForm.controls["trackingId"].patchValue(
		// 		this.depositInfo.trackingDetails.trackingId
		// 	);
		// }
		// if (
		// 	this.depositInfo.trackingDetails &&
		// 	this.depositInfo.trackingDetails.logisticPartnerId
		// ) {
		// 	this.depositForm.controls["logisticPartnerId"].patchValue(
		// 		this.depositInfo.trackingDetails.logisticPartnerId
		// 	);
		// }

	// 	switch (this.depositInfo.currentStatus.statusId) {
	// 		case 5:
	// 		case 7:
	// 			this.hiddenFlag = true;
	// 			this.getOrderLogistic();
	// 			break;
	// 		case 8:
	// 			this.showUploadedFile = true;
	// 			this.getOrderLogistic();
	// 			this.depositForm.disable();
	// 			break;
	// 		case 6:
	// 		case 11:
	// 		case 12:
	// 			this.hiddenFlag = true;
	// 			this.getOrderLogistic();
	// 			this.depositForm.controls["trackingId"].disable();
	// 			this.depositForm.controls["logisticPartnerId"].disable();
	// 			break;
	// 		default:
	// 			this.hiddenFlag = false;
	// 			this.depositForm.disable();
	// 			break;
	// 	}
	// 	this.ref.detectChanges();
	}

	// getOrderLogistic() {
	// 	this.orderDetailsService.getOrderLogistic().subscribe((res) => {
	// 		this.orderLogistic = res;
	// 		this.ref.detectChanges();
	// 	});
	// }

	// uploadImage(data) {
	// 	if (data.fieldName == "uploadedAwbFile") {
	// 		this.depositForm.controls["uploadedAwbFile"].patchValue(
	// 			data.uploadData.id
	// 		);
	// 	} else if (data.fieldName == "uploadedAwbBox") {
	// 		this.depositForm.controls["uploadedAwbBox"].patchValue(
	// 			data.uploadData.id
	// 		);
	// 	}
	// }

	// removeImage(data) {
	// 	if (data.fieldName == "uploadedAwbFile") {
	// 		this.depositForm.controls["uploadedAwbFile"].patchValue("");
	// 	} else if (data.fieldName == "uploadedAwbBox") {
	// 		this.depositForm.controls["uploadedAwbBox"].patchValue("");
	// 	}
	// }

	// setAwbValidators() {
	// 	const uploadedAwbFileControl = this.depositForm.get("uploadedAwbFile");
	// 	const uploadedAwbBoxControl = this.depositForm.get("uploadedAwbBox");

	// 	this.depositForm.get("statusId").valueChanges.subscribe((val) => {
	// 		if (val == "8") {
	// 			this.showUploadFile = true;
	// 			uploadedAwbFileControl.setValidators([Validators.required]);
	// 			uploadedAwbBoxControl.setValidators([Validators.required]);
	// 		} else {
	// 			this.showUploadFile = false;
	// 			uploadedAwbFileControl.setValidators([]);
	// 			uploadedAwbBoxControl.setValidators([]);
	// 		}
	// 		uploadedAwbFileControl.updateValueAndValidity();
	// 		uploadedAwbBoxControl.updateValueAndValidity();
	// 	});
	// }

	submit() {
		if (this.depositForm.invalid) {
			this.depositForm.markAllAsTouched();
			return;
    }
    if (this.depositId) {
			const depositData = {
				depositStatus: this.controls.depositStatus.value,
			
			};
			
			this.depositRequestsService.editDepositStatus(depositData, this.depositId)
				.pipe(
					map((res) => {
						this.toastr.successToastr(
							"Deposit Status Updated Sucessfully"
						);
						this.router.navigate(["/admin/digi-gold/wallet/deposit-reruests"]);
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
