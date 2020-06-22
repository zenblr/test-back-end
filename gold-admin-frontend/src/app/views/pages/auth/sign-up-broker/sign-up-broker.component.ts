import { Component, OnInit, Inject, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ToastrComponent } from '../../../partials/components/toastr/toastr.component';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { SharedService } from '../../../../core/shared/services/shared.service';

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
			fullName: ['', Validators.required],
			mobileNumber: ['', [Validators.required, Validators.pattern('^[7-9][0-9]{9}$')]],
			email: ['', Validators.email],
			address: ['', Validators.required],
			postalCode: ['', Validators.required],
			stateName: ['', Validators.required],
			cityName: ['', Validators.required],
			storeId: [''],
			panCardNumber: [''],
			nameOnPanCard: [''],
			pancard: [''],
		});
	}

	get controls() {
		return this.registerForm.controls;
	}

	getStates() {
		this.sharedService.getStates().subscribe(res => this.stateList = res.message);
	}

	getCities() {
		if (this.controls.stateName.value == '') {
			this.cityList = [];
		} else {
			let stateData;
			stateData = this.controls.stateName.value.id;
			this.sharedService.getCities(stateData).subscribe(res => {
				this.cityList = res.message;
				this.ref.detectChanges();
			});
		}
	}

	uploadImage(data) {
		this.registerForm.controls["pancard"].patchValue(
			data.uploadData.URL
		);
	}

	removeImage(data) {
		this.registerForm.controls["pancard"].patchValue("");
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
	}

	action(event: Event) {
		if (event) {
			this.submit();
		} else if (!event) {
			this.dialogRef.close();
		}
	}
}
