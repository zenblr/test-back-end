import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, ViewChild, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../../../../../../core/shared/services/shared.service';
import { map, catchError } from 'rxjs/operators';
import { MerchantService } from '../../../../../../../../core/user-management/merchant';
import { ToastrComponent } from '../../../../../../../partials/components';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BrokerService } from '../../../../../../../../core/user-management/broker';

@Component({
  selector: 'kt-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {

  userDetails: FormGroup;
  states: [] = [];
  cityId: [] = [];
  userId: number
  userInfo:any[]=[]
  status:any []=[]
  url:any;
  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
 

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private merchantService: MerchantService,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private toast:ToastrService,
    private brokerService:BrokerService,
    public router:Router
  ) {
    this.url = this.router.url.split('/')[3]
    this.merchantService.userId$.subscribe();
  }

  ngOnInit() {
    this.initForm()
    this.getStates()
    this.getStatus()
    this.userId = this.route.snapshot.params.id
    if (this.userId) {
      this.merchantService.getMerchantById(this.userId).pipe(
        map(res =>{
         this.userInfo = res;
         this.editRole()
        }),catchError(err =>{
          // this.toast.error(err.error.message)
          throw err
        })).subscribe()
    }
  }

  initForm() {
    this.userDetails = this.fb.group({
      merchantName: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [Validators.required,Validators.minLength(10)]],
      stateId: ['',Validators.required],
      cityId: ['',Validators.required],
      pinCode: ['', [Validators.required,Validators.minLength(6)]],
      initial:['',[Validators.required,Validators.minLength(2)]]
    })
    
    if(this.url == 'edit-merchant'){
      this.userDetails.controls.initial.clearValidators();
      this.userDetails.controls.initial.updateValueAndValidity();
    }
  }
 
  editRole(){
    const merchantDetails = this.userInfo['merchantData']
    var data = {
      merchantName: merchantDetails.merchantName,
      firstName: merchantDetails.user.firstName,
      lastName: merchantDetails.user.lastName,
      email: merchantDetails.user.email,
      mobileNumber: merchantDetails.user.mobileNumber,
      stateId: merchantDetails.user.address[0].state.id,
      cityId: merchantDetails.user.address[0].city.id,
      pinCode:  merchantDetails.user.address[0].postalCode,
      initial: merchantDetails.initial
    }
    
    this.userDetails.patchValue(data)
    this.getCities()
    console.log(this.userDetails.value)
    this.ref.detectChanges()
  }

  get controls() {
    if (this.userDetails)
      return this.userDetails.controls
  }

  getStatus(){
    this.brokerService.getStatus().pipe(
      map(res =>{
        this.status = res;
      })
    ).subscribe()
  }
  getStates() {
    this.sharedService.getStates().pipe(
      map(res => {
        this.states = res.message;
        this.ref.detectChanges();
      })).subscribe()
  }
  getCities() {
    if (this.controls.stateId.value == '') {
      this.cityId = []
    } else {
      this.sharedService.getCities(this.controls.stateId.value).pipe(
        map(res => {
          this.cityId = res.message;
        this.ref.detectChanges();
        })).subscribe()
    }
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
    if(!this.userId){
    this.merchantService.merchantPersonalDetails(this.userDetails.value).pipe(
      map(res => {
        this.merchantService.userId.next(res.userId)
        console.log(res);
        this.next.emit(true);
      }),
      catchError(err => {
        this.toastr.errorToastr(err.error.message)
        throw err;
      })).subscribe()
    }else{
      this.merchantService.editMerchant(this.userDetails.value,this.userId).pipe(
        map(res => {
          this.merchantService.userId.next(res.userId)
          console.log(res);
          this.next.emit(true);
        }),
        catchError(err => {
          this.toastr.errorToastr(err.error.message)
          throw err;
        })).subscribe()
      }
  }


}
