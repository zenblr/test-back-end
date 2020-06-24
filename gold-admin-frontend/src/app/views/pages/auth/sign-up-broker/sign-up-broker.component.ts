import { Component, OnInit, Inject, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ToastrComponent } from '../../../partials/components/toastr/toastr.component';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { AuthService } from '../../../../core/auth';
import { error } from 'protractor';

@Component({
	selector: 'kt-sign-up-broker',
	templateUrl: './sign-up-broker.component.html',
	styleUrls: ['./sign-up-broker.component.scss'],
})
export class SignUpBrokerComponent implements OnInit, OnDestroy {
	@ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
	registerForm: FormGroup;
	title: string = 'Register as a broker';
	stateList = [];
	cityList = [];
	isMandatory: boolean = true;
	private unsubscribe: Subject<any>;
	private returnUrl: any;

	constructor(
		private fb: FormBuilder,
		private sharedService: SharedService,
		public dialogRef: MatDialogRef<SignUpBrokerComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private ref: ChangeDetectorRef,
		private auth: AuthService
	) {
		this.unsubscribe = new Subject();

	}

	ngOnInit(): void {
		this.initLoginForm();
		this.getStates();

	}

	ngOnDestroy(): void {
		this.unsubscribe.next();
		this.unsubscribe.complete();
	}

	initLoginForm() {
		this.registerForm = this.fb.group({
			firstName: ['', Validators.required],
			lastName: ['', Validators.required],
			mobileNumber: ['', [Validators.required, Validators.pattern('^[7-9][0-9]{9}$')]],
			email: ['', Validators.compose([Validators.required, Validators.email])],
			address: ['', Validators.required],
			pinCode: ['', Validators.required],
			stateId: ['', Validators.required],
			cityId: ['', Validators.required],
			storeId: [''],
			panCardNumber: ['', Validators.compose([Validators.required, Validators.pattern("[A-Z]{5}[0-9]{4}[A-Z]{1}")])],
			nameOnPanCard: ['', Validators.compose([Validators.required, Validators.pattern("^[a-zA-Z ]*$")])],
			panCard: [''],
		});
	}

	get controls() {
		return this.registerForm.controls;
	}

	getStates() {
		this.sharedService.getStates().subscribe(res => this.stateList = res.message);
	}

	getCities() {
		if (this.controls.stateId.value == '') {
			this.cityList = [];
		} else {
			let stateData;
			stateData = this.controls.stateId.value;
			this.sharedService.getCities(stateData).subscribe(res => {
				this.cityList = res.message;
				this.ref.detectChanges();
			});
		}
	}

	uploadImage(data) {
		this.registerForm.controls["panCard"].patchValue(
			data.uploadData.id
		);
	}

	removeImage(data) {
		this.registerForm.controls["panCard"].patchValue("");
	}

	submit() {
		const controls = this.registerForm.controls;
		/** check form */
		if (this.registerForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			return;
		}

		this.auth.registerBroker(this.registerForm.value).subscribe(res => {
			this.toastr.successToastr(res.message);
			this.dialogRef.close();
		},
			error => {
				this.toastr.errorToastr(error.error.message);
			});
	}

	action(event: Event) {
		if (event) {
			this.submit();
		} else if (!event) {
			this.dialogRef.close();
		}
	}
}
