import { Component, OnInit, AfterViewInit, EventEmitter, Output, Input, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoanApplicationFormService } from '../../../../../../core/loan-management';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-nominee-details',
  templateUrl: './nominee-details.component.html',
  styleUrls: ['./nominee-details.component.scss']
})
export class NomineeDetailsComponent implements OnInit, AfterViewInit {

  @Input() loanId
  @Input() details;
  nominee: FormGroup;
  @Input() disable;
  // @Output() nomineeEmit: EventEmitter<any> = new EventEmitter()
  @Input() invalid;
  @Input() action;
  @Output() next: EventEmitter<any> = new EventEmitter()

  constructor(
    public fb: FormBuilder,
    public ref: ChangeDetectorRef,
    public loanApplicationService:LoanApplicationFormService,
    public toast:ToastrService
  ) { }

  ngOnInit() {
    this.initForm()
  }

  ngOnChanges(changes:SimpleChanges) {
    if(changes.details){
    if(changes.action.currentValue == 'edit'){
      this.nominee.patchValue(changes.details.currentValue.loanNomineeDetail[0])
      this.ref.markForCheck()

    }
  }
    if (this.invalid) {
      this.nominee.markAllAsTouched()
      this.invalid = false
    }
    if(this.disable){
      this.nominee.disable()
    }
  }
  ngAfterViewInit() {
    // this.nominee.valueChanges.subscribe(() => {
    //   this.nomineeEmit.emit({ nominee: this.nominee })
    // })
  }

  initForm() {
    this.nominee = this.fb.group({
      nomineeName: [, [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      nomineeAge: [, Validators.required],
      relationship: [, [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      nomineeType: ["major"],
      guardianName: [, [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      guardianAge: ['', [Validators.required, Validators.pattern('^0*(1[89]|[2-9][0-9]|100)$')]],
      guardianRelationship: [, [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
    })
    this.checkForMinor()
    // this.nomineeEmit.emit({ nominee: this.nominee })
  }

  checkForMinor() {
    if (this.controls.nomineeAge.value == null || this.controls.nomineeAge.value >= 18) {
      this.controls.nomineeType.patchValue("major")
      this.controls.guardianAge.clearValidators();
      this.controls.guardianName.clearValidators();
      this.controls.guardianRelationship.clearValidators();
    }
    else if (this.controls.nomineeAge.value < 18) {
      this.controls.guardianAge.setValidators(Validators.required);
      this.controls.guardianRelationship.setValidators(Validators.required);
      this.controls.guardianName.setValidators(Validators.required);
      this.controls.guardianAge.setValidators(Validators.pattern('^0*(1[89]|[2-9][0-9]|100)$'));
      this.controls.guardianRelationship.setValidators(Validators.pattern('^[a-zA-Z ]*$'));
      this.controls.guardianName.setValidators(Validators.pattern('^[a-zA-Z ]*$'));
      this.controls.nomineeType.patchValue("minor")
    }
    this.controls.guardianAge.updateValueAndValidity()
    this.controls.guardianName.updateValueAndValidity()
    this.controls.guardianRelationship.updateValueAndValidity()
  }

  get controls() {
    return this.nominee.controls
  }

  // scrollToOrnaments() {
  //   if (this.nominee.invalid) {
  //     this.nominee.markAllAsTouched();
  //     return;
  //   }
  //   // this.nomineeEmit.emit({ nominee: this.nominee});
  // }
  nextAction(){
    if(this.nominee.invalid){
      this.nominee.markAllAsTouched();
      return
    }
    this.loanApplicationService.nomineeSubmit(this.nominee.value,this.loanId).pipe(
      map(res=>{
        this.next.emit(2)
      }),catchError(err=>{
        this.toast.error(err.error.message)
        throw err
      })).subscribe()
  }

}
