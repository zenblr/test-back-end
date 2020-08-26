import { Component, OnInit, Inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { map, catchError, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ToastrComponent } from '../../../../../../partials/components';
import { SharedService } from '../../../../../../../core/shared/services/shared.service';
import { DepositDetailsService } from '../../../../../../../core/emi-management/order-management/deposit-details/services/deposit-details.service';

@Component({
	selector: 'kt-deposit-details-edit',
	templateUrl: './deposit-details-edit.component.html',
	styleUrls: ['./deposit-details-edit.component.scss'],
})
export class DepositDetailsEditComponent implements OnInit {
	@ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
	viewLoading = false;
	depositForm: FormGroup;
	depositInfo: any;
	title: string;
	transactionStatusList = [];
	hiddenFlag = false;

	constructor(
		public dialogRef: MatDialogRef<DepositDetailsEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private depositDetailsService: DepositDetailsService,
		private fb: FormBuilder,
		private sharedService: SharedService,
		private ref: ChangeDetectorRef,
		private route: ActivatedRoute,
		private toast: ToastrService,
		private router: Router
	) { }

	ngOnInit() {
		this.formInitialize();
		this.title = 'Update Deposit Status';
		if (this.data.depositDetailsData) {
			this.depositInfo = this.data.depositDetailsData;
			this.editDeposit();
			this.getTransactionStatus();
		}
	}

	formInitialize() {
		this.depositForm = this.fb.group({
			id: [''],
			transactionId: [''],
			paymentMode: [''],
			bankName: [''],
			bankBranch: [''],
			paymentRecievedDate: [''],
			transactionAmount: [''],
			transactionStatusId: ['', Validators.required],
		});
		this.depositForm.valueChanges.subscribe((val) => console.log(val));
	}

	get controls() {
		if (this.depositForm) {
			return this.depositForm.controls;
		}
	}

	editDeposit() {
		this.depositForm.patchValue(this.depositInfo);
		if (this.depositInfo.paymentStatusId != 1) {
			this.depositForm.controls['transactionStatusId'].patchValue(this.depositInfo.paymentStatusId);
		}
		switch (this.depositInfo.paymentStatusId) {
			case 1:
				this.hiddenFlag = true;
				break;
			default:
				this.hiddenFlag = false;
				this.depositForm.disable();
				break;
		}
		this.ref.detectChanges();
	}

	getTransactionStatus() {
		this.depositDetailsService.getTransactionStatus().subscribe((res) => {
			this.transactionStatusList = res;
			this.ref.detectChanges();
		});
	}

	action(event) {
		if (event) {
			this.submit()
		} else if (!event) {
			this.dialogRef.close()
		}
	}

	submit() {
		if (this.depositForm.invalid) {
			this.depositForm.markAllAsTouched();
			return;
		}
		const depositData = {
			transactionStatusId: this.controls.transactionStatusId.value,
		};
		console.log(depositData);
		this.depositDetailsService.editPaymentStatus(depositData, this.controls.id.value)
			.pipe(
				map((res) => {
					this.dialogRef.close(true);
				}),
				catchError((err) => {
					this.toastr.errorToastr(err.error.message);
					throw err;
				})
			)
			.subscribe();
	}
}
