import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UserDetailsService } from '../../../../core/kyc-settings/services/user-details.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerClassificationService } from '../../../../core/kyc-settings/services/customer-classification.service';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-user-classification',
  templateUrl: './user-classification.component.html',
  styleUrls: ['./user-classification.component.scss']
})
export class UserClassificationComponent implements OnInit {

  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  cceKycStatus = [{ value: 'approved', name: 'approved' }, { value: 'pending', name: 'pending' }];
  bmKycStatus = [{ value: 'approved', name: 'approved' }, { value: 'rejected', name: 'rejected' }];

  // kycStatus = [];
  rating = [];
  custClassificationForm: FormGroup;
  customerDetails = this.userDetailsService.userData;
  // customerDetails = { customerId: 1, customerKycId: 2, stateId: 2, cityId: 5, pinCode: 123456 }
  showTextBoxCce = true;

  constructor(
    private userDetailsService: UserDetailsService,
    private custClassificationService: CustomerClassificationService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.getRating();
    this.initForm();

    this.custClassificationForm.get('kycStatusFromCce').valueChanges.subscribe(res => {
      if (res == 'pending') {
        this.custClassificationForm.get('reasonFromCce').setValidators(Validators.required);
        this.showTextBoxCce = true;
      } else if (res == 'approved') {
        this.custClassificationForm.get('reasonFromCce').clearValidators();
        this.custClassificationForm.get('reasonFromCce').patchValue('');
        this.showTextBoxCce = false;
      }
      this.custClassificationForm.get('reasonFromCce').updateValueAndValidity();
    })
  }

  initForm() {
    this.custClassificationForm = this.fb.group({
      customerId: [this.customerDetails.customerId, [Validators.required]],
      customerKycId: [this.customerDetails.customerKycId, [Validators.required]],
      behaviourRatingCce: ['', [Validators.required]],
      idProofRatingCce: ['', [Validators.required]],
      addressProofRatingCce: ['', [Validators.required]],
      kycStatusFromCce: ['', [Validators.required]],
      reasonFromCce: []
    })
  }

  getRating() {
    this.custClassificationService.getRating().pipe(
      map(res => {
        this.rating = res;
      })
    ).subscribe()
  }

  submit() {


    if (this.custClassificationForm.invalid) {
      this.custClassificationForm.markAllAsTouched();
      return;
    }

    console.log(this.custClassificationForm.value)

    this.custClassificationForm.patchValue({
      behaviourRatingCce: +(this.custClassificationForm.get('behaviourRatingCce').value),
      idProofRatingCce: +(this.custClassificationForm.get('idProofRatingCce').value),
      addressProofRatingCce: +(this.custClassificationForm.get('addressProofRatingCce').value),
    })

    this.custClassificationService.cceRating(this.custClassificationForm.value).pipe(
      map(res => {
        if (res) {
          this.toastr.success(res.message);
          this.next.emit(true);
        }
      })
    ).subscribe();
  }

  get cceControls() {
    return this.custClassificationForm.controls;
  }

}
