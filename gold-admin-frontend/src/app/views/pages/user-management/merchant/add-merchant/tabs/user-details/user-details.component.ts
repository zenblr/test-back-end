import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../../../../../core/shared/services/shared.service';
import { map, catchError } from 'rxjs/operators';
import { MerchantService } from '../../../../../../../core/user-management/merchant';
import { ToastrComponent } from '../../../../../../../views/partials/components';

@Component({
  selector: 'kt-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {

  userDetails: FormGroup;
  states: [] = [];
  cityId: [] = []
  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;


  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private merchantService:MerchantService,
    private ref:ChangeDetectorRef,
  ) {
    this.merchantService.userId$.subscribe();
   }

  ngOnInit() {
    this.initForm()
    this.getStates()
    this.userDetails.valueChanges.subscribe(res => {
      console.log(this.userDetails)
    })
  }

  initForm() {
    this.userDetails = this.fb.group({
      merchantName: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName:['',Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', Validators.required],
      stateId: [Validators.required],
      cityId: [Validators.required],
      pinCode: ['', Validators.required]
    })
  }


  get controls() {
    if (this.userDetails)
      return this.userDetails.controls
  }

  getStates() {
    this.sharedService.getStates().pipe(
      map(res => {
        this.states = res.message;
        this.ref.detectChanges();
      })).subscribe()
  }
  getCities() {
    // if (this.controls.stateId.value == '') {
    //   this.cityId = []
    // } else {
    //   this.sharedService.getCities(this.controls.stateId.value).pipe(
    //     map(res => {
    //       this.cityId = res.message;
    //     this.ref.detectChanges();
    //     })).subscribe()
    // }
  }

  submit() {
    if (this.userDetails.invalid) {
      this.userDetails.markAllAsTouched()
      return
    }
    this.controls.cityId.patchValue(parseInt(this.controls.cityId.value))
    this.controls.stateId.patchValue(parseInt(this.controls.stateId.value))
    this.controls.pinCode.patchValue(parseInt(this.controls.pinCode.value))
    console.log(this.userDetails.value)
    this.merchantService.merchantPersonalDetails(this.userDetails.value).pipe(
      map(res =>{
        this.merchantService.userId.next(res.userId)
        console.log(res);
        this.next.emit(true);
      }),
      catchError(err =>{
        this.toastr.errorToastr(err.error.message)
        throw err;
      })).subscribe()
    
  }


}
