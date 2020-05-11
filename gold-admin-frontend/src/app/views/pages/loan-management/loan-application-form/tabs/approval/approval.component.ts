import { Component, OnInit, Output, EventEmitter, Input, AfterViewInit, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-approval',
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.scss']
})
export class ApprovalComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() disable
  @Input() invalid;
  @Output() approvalFormEmit: EventEmitter<any> = new EventEmitter<any>();
  appraiser = [{ value: 'confirmed', name: 'approved' }, { value: 'pending', name: 'pending' }];
  branchManager = [{ value: 'confirmed', name: 'approved' }, { value: 'rejected', name: 'rejected' }];

  // kycStatus = [];
  approvalForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.approvalForm = this.fb.group({
      applicationFormForAppraiser: [false],
      goldValuationForAppraiser: [false],
      loanStatusForAppraiser: ['', Validators.required]
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
    if(this.disable){
      this.approvalForm.disable()
    }
  }

  ngAfterViewInit() {
    this.approvalForm.valueChanges.subscribe(() => {
      this.approvalFormEmit.emit(this.approvalForm)
    })
  }

  approvalOfAppraiser(value: boolean, type: string) {
    if (type == 'gold') {
      this.controls.goldValuationForAppraiser.patchValue(value)
    } else {
      this.controls.applicationFormForAppraiser.patchValue(value)

    }
  }
}
