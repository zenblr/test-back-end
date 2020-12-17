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
import { WithdrawalRequestsService } from "../../../../../../../core/wallet/withdrawal-requests/withdrawal-requests.service";
import { Subject } from "rxjs";

@Component({
	selector: 'kt-withdrawal-requests-edit',
	templateUrl: './withdrawal-requests-edit.component.html',
	styleUrls: ['./withdrawal-requests-edit.component.scss']
})
export class WithdrawalRequestsEditComponent implements OnInit {

	viewLoading = false;
	withdrawForm: FormGroup;
	withdrawId: number;
	withdrawInfo: any;
	withdrawalStatus = [
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
		@Inject(MAT_DIALOG_DATA) public data: any,
		private withdrawalRequestsService: WithdrawalRequestsService,
		private fb: FormBuilder,
		private sharedService: SharedService,
		private ref: ChangeDetectorRef,
		private route: ActivatedRoute,
		private toast: ToastrService,
		private router: Router
	) {
	}

	ngOnInit() {
		this.formInitialize();
		this.withdrawId = this.route.snapshot.params.id;
		if (this.withdrawId) {
			this.withdrawalRequestsService.getWithdrawById(this.withdrawId)
				.pipe(
					map((res) => {
						this.withdrawInfo = res;
						// this.withdrawForm.patchValue(res.transactionData);
						this.editWithdraw();
					})
				)
				.subscribe();
		}
	}

	formInitialize() {
		this.withdrawForm = this.fb.group({
			customerId: [""],
			customerFullName: [""],
			mobileNumber: [""],
			transactionUniqueId: [""],
			withdrawalInitiatedDate: [""],
			withdrawalAmount: [""],
			bankName: [""],
			branchName: [""],
			accountNumber: [""],
			accountHolderName: [""],
			ifscCode: [""],
			withdrawalStatus: [""],
			
		});


		this.withdrawForm.valueChanges.subscribe((val) => console.log(val));
	}

	get controls() {
		if (this.withdrawForm) return this.withdrawForm.controls;
	}

	editWithdraw() {
		const data = {
			customerId: this.withdrawInfo.transactionData.customerId,
			customerFullName: this.withdrawInfo.transactionData.customer.firstName + ' ' + this.withdrawInfo.transactionData.customer.lastName,
			mobileNumber: this.withdrawInfo.transactionData.customer.mobileNumber,
			transactionUniqueId: this.withdrawInfo.transactionData.transactionUniqueId,
			withdrawalInitiatedDate: this.withdrawInfo.transactionData.depositDate,
			withdrawalAmount: this.withdrawInfo.transactionData.transactionAmont,
			bankName: this.withdrawInfo.transactionData.bankName,
            branchName: this.withdrawInfo.transactionData.branchName,
			accountNumber: this.withdrawInfo.transactionData.accountNumber,
			accountHolderName: this.withdrawInfo.transactionData.accountHolderName,
			ifscCode: this.withdrawInfo.transactionData.ifscCode,
            withdrawalStatus: this.withdrawInfo.transactionData.depositStatus,

		};
		this.withdrawForm.patchValue(data);

	}
	submit() {
		if (this.withdrawForm.invalid) {
			this.withdrawForm.markAllAsTouched();
			return;
		}
		if (this.withdrawId) {
			const depositData = {
				depositStatus: this.controls.withdrawalStatus.value,

			};

			this.withdrawalRequestsService.editWithdrawStatus(depositData, this.withdrawId)
				.pipe(
					map((res) => {
						this.toastr.successToastr(
							"Withdrawal Status Updated Sucessfully"
						);
						this.router.navigate(["/admin/digi-gold/wallet/withdrawal-requests"]);
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
