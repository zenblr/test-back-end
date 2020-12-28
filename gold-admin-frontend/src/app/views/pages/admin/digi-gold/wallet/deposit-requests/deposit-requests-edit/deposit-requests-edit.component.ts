import { Component, OnInit, Inject, Output, EventEmitter, ChangeDetectorRef, ViewChild, Input, } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { map, catchError, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ToastrComponent } from '../../../../../../partials/components';
import { SharedService } from '../../../../../../../core/shared/services/shared.service';
import { DepositRequestsService } from '../../../../../../../core/wallet/deposit-requests/deposit-requests.service';
import { Subject } from 'rxjs';

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
		// { value: 'pending', name: 'Pending' },
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
		private depositRequestsService: DepositRequestsService,
		private fb: FormBuilder,
		private sharedService: SharedService,
		private ref: ChangeDetectorRef,
		private route: ActivatedRoute,
		private toast: ToastrService,
		private router: Router
	) { }

	ngOnInit() {
		this.formInitialize();
		this.depositId = this.route.snapshot.params.id;
		if (this.depositId) {
			this.depositRequestsService.getDepositById(this.depositId).pipe(
				map((res) => {
					this.depositInfo = res;
					this.editOrder();
				})
			).subscribe();
		}
	}

	formInitialize() {
		this.depositForm = this.fb.group({
			bankTransactionID: [''],
			depositmodeofpayment: [''],
			depositBankName: [''],
			depositBranchName: [''],
			depositDate: [''],
			depositAmount: [''],
			depositStatus: ['', Validators.required],
		});
		this.depositForm.disable()
		this.depositForm.valueChanges.subscribe((val) => console.log(val));
	}

	get controls() {
		if (this.depositForm) {
			return this.depositForm.controls;
		}
	}

	editOrder() {
		const data = {
			bankTransactionID: this.depositInfo.transactionData.bankTransactionUniqueId ? this.depositInfo.transactionData.bankTransactionUniqueId : 'NA',
			depositmodeofpayment: this.depositInfo.transactionData.paymentType,
			depositBankName: this.depositInfo.transactionData.bankName ? this.depositInfo.transactionData.bankName : 'NA',
			depositBranchName: this.depositInfo.transactionData.branchName ? this.depositInfo.transactionData.branchName : 'NA',
			depositDate: this.depositInfo.transactionData.depositDate,
			depositAmount: this.depositInfo.transactionData.transactionAmount,
			depositStatus: '',
		};
		this.depositForm.patchValue(data);

		if (!(this.depositInfo.transactionData.depositStatus == 'pending')) {
			data.depositStatus = this.depositInfo.transactionData.depositStatus;
			this.depositForm.patchValue(data);
		}
		else {
			this.controls.depositStatus.enable();
		}
	}

	submit() {
		if (this.depositForm.invalid) {
			this.depositForm.markAllAsTouched();
			return;
		}
		if (this.depositId) {
			const depositData = {
				depositStatus: this.controls.depositStatus.value,
			};
			this.depositRequestsService.editDepositStatus(depositData, this.depositId).pipe(
				map((res) => {
					this.toastr.successToastr('Deposit Status Updated Sucessfully');
					this.router.navigate(['/admin/digi-gold/wallet/deposit-requests']);
				}),
				catchError((err) => {
					this.toastr.errorToastr(err.error.message);
					throw err;
				})
			).subscribe();
		}
	}
}
