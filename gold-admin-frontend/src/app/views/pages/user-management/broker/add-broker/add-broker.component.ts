import { Component, OnInit, Inject } from '@angular/core';
import { BrokerService } from '../../../../../core/user-management/broker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';

@Component({
  selector: 'kt-add-broker',
  templateUrl: './add-broker.component.html',
  styleUrls: ['./add-broker.component.scss']
})
export class AddBrokerComponent implements OnInit {

  title: string;
  states: any[] = [];
  citys: any[] = [];
  brokerFrom: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddBrokerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private brokerService: BrokerService,
  ) { }

  ngOnInit() {
    this.initForm();
    this.getStates();
    console.log(this.data)
    if (this.data.action == 'add') {
      this.title = 'Add Role'
    } else {
      this.title = 'Edit Role'
    }
  }

  initForm() {
    this.brokerFrom = this.fb.group({
      merchantName: ['', Validators.required],
      brokerId: ['', Validators.required],
      fullName: ['', Validators.required],
      mobileNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      pincode: ['', Validators.required],
      status: ['', Validators.required],
    })
  }

  get controls() {
    if (this.brokerFrom)
      return this.brokerFrom.controls
  }

  getStates() {
    this.sharedService.getStates().pipe(map(
      res => {
        this.states = res.message;
      }
    )).subscribe()
  }
  
  getCities(){
    this.sharedService.getCities(this.controls.state.value).pipe(map(
      res=>{
        this.citys = res.message;
      }
    )).subscribe()
  }

  action(event: Event) {
    if (event) {
      if (this.brokerFrom.invalid) {
        this.brokerFrom.markAllAsTouched()
      }
    } else if (!event) {
      this.dialogRef.close()
    }
  }



}
