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
  kycStatus = [{ value: 'confirm', name: 'confirm' }, { value: 'pending', name: 'pending' }, { value: 'closed', name: 'closed' }];
  // kycStatus = [];
  rating = [];
  custClassificationForm: FormGroup;
  // customerDetails = this.userDetailsService.userData;
  customerDetails = { customerId: 1, customerKycId: 2, stateId: 2, cityId: 5, pinCode: 123456 }

  constructor(
    private userDetailsService: UserDetailsService,
    private custClassificationService: CustomerClassificationService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.getRating();
    this.initForm();
  }

  initForm() {
    this.custClassificationForm = this.fb.group({
      customerId: [this.customerDetails.customerId, [Validators.required]],
      customerKycId: [this.customerDetails.customerKycId, [Validators.required]],
      behaviourRatingCce: ['', [Validators.required]],
      idProofRatingCce: ['', [Validators.required]],
      addressProofRatingCce: ['', [Validators.required]],
      kycStatusFromCce: ['', [Validators.required]],
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

    this.custClassificationService.cceRating(this.custClassificationForm.value).pipe(
      map(res => {
        if (res) {
          this.toastr.success(res.message);
          this.next.emit(true);
        }
      })
    ).subscribe();
  }


}
