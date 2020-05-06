import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-approval',
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.scss']
})
export class ApprovalComponent implements OnInit {

  @Input() disable;
  @Input() invalid;
  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  appraiser = [{ value: 'approved', name: 'approved' }, { value: 'pending', name: 'pending' }];
  branchManager = [{ value: 'approved', name: 'approved' }, { value: 'rejected', name: 'rejected' }];

  // kycStatus = [];
  
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    // this.getRating();
    this.initForm();
  }

  initForm() {
  }

}
