import { Component, OnInit, Output, EventEmitter, Input, AfterViewInit, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../../../../core/shared/services/shared.service';

@Component({
  selector: 'kt-approval',
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.scss']
})
export class ApprovalComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() disable
  @Input() invalid;
  @Output() approvalFormEmit: EventEmitter<any> = new EventEmitter<any>();
  appraiser = [{ value: 'approved', name: 'approved' }, { value: 'pending', name: 'pending' }];
  branchManager = [{ value: 'approved', name: 'approved' }, { value: 'rejected', name: 'rejected' }];
  role: any = ''
  // kycStatus = [];
  approvalForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private sharedSerive: SharedService
  ) { }

  ngOnInit() {
    this.initForm();
    this.getRoles()
  }
  getRoles() {
    this.sharedSerive.getRole().subscribe(res => {
      this.role = res
      if(this.role == 'Appraiser'){
        this.controls.loanStatusForBM.disable()
      }else if(this.role == 'Branch Manager'){
        this.controls.loanStatusForAppraiser.disable()
      }else{
        this.approvalForm.disable()
      }
    })
  }

  initForm() {
    this.approvalForm = this.fb.group({
      applicationFormForAppraiser: [false],
      goldValuationForAppraiser: [false],
      loanStatusForAppraiser: ['', Validators.required],
      commentByAppraiser: [''],
      applicationFormForBM: [false],
      goldValuationForBM: [false],
      loanStatusForBM: [''],
      commentByBM: [''],
    })
    this.approvalFormEmit.emit(this.approvalForm)

  }
  get controls() {
    return this.approvalForm.controls
  }

  ngOnChanges() {
    if (this.invalid) {
      this.approvalForm.markAllAsTouched()
    }
    if (this.disable) {
      this.approvalForm.disable()
    }
  }

  ngAfterViewInit() {
    this.approvalForm.valueChanges.subscribe(() => {
      this.approvalFormEmit.emit(this.approvalForm)
    })
  }

  approvalOfAppraiser(value: boolean, type: string) {
    if (this.role == 'Appraiser') {
      if (type == 'gold') {
        this.controls.goldValuationForAppraiser.patchValue(value)
      } else {
        this.controls.applicationFormForAppraiser.patchValue(value)
      }
    }
  }
  approvalOfBM(value: boolean, type: string) {
    if (this.role == 'Branch Manager') {
      if (type == 'gold') {
        this.controls.goldValuationForBM.patchValue(value)
      } else {
        this.controls.applicationFormForBM.patchValue(value)
      }
    }
  }
  statusAppraiser() {
    if (this.controls.loanStatusForAppraiser.value == 'pending') {
      this.controls.commentByAppraiser.setValidators(Validators.required);
      this.controls.commentByAppraiser.updateValueAndValidity()
    } else {
      this.controls.commentByAppraiser.clearValidators();
      this.controls.commentByAppraiser.updateValueAndValidity();
      this.controls.commentByAppraiser.markAsUntouched()
    }
  }
  statusBM() {
    if (this.controls.loanStatusForBM.value == 'rejected') {
      this.controls.commentByBM.setValidators(Validators.required);
      this.controls.commentByBM.updateValueAndValidity()
    } else {
      this.controls.commentByBM.clearValidators();
      this.controls.commentByBM.updateValueAndValidity();
      this.controls.commentByBM.markAsUntouched()
    }
  }
}
