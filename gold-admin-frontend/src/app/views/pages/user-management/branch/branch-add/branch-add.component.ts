import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { BranchService } from '../../../../../core/user-management/branch/services/branch.service';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { DialogData } from '../../../material/popups-and-modals/dialog/dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ToastrComponent } from '../../../../../views/partials/components/toastr/toastr.component';

@Component({
  selector: 'kt-branch-add',
  templateUrl: './branch-add.component.html',
  styleUrls: ['./branch-add.component.scss']
})
export class BranchAddComponent implements OnInit {

  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  branchForm: FormGroup;
  states: any;
  cities: any;
  canEdit = false;

  constructor(public dialogRef: MatDialogRef<BranchAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private branchService: BranchService
  ) { }

  ngOnInit() {
    this.formInitialize();
    this.getStates();
    console.log(this.data);
    if (this.data['action'] !== 'add') {
      this.getPartnerById(this.data['partnerId']);
    }
  }

  formInitialize() {
    this.branchForm = this.fb.group({
      name: ['', [Validators.required]],
      partnerId: ['', [Validators.required]],
      commission: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      state: ['', [Validators.required]],
      city: ['', [Validators.required]],
      address: ['', [Validators.required]],
    });
  }

  getStates() {
    this.sharedService.getStates().subscribe(res => {
      this.states = res.message;
    },
      error => {
        // console.error(error);
      });
  }

  getCities(event) {
    // console.log(event);
    const stateId = this.controls.state.value;
    console.log(stateId);
    this.sharedService.getCities(stateId).subscribe(res => {
      this.cities = res.message;
    },
      error => {
        // console.error(error);
      });
  }

  getPartnerById(id) {
    this.branchService.getBranchById(id).subscribe(res => {
      console.log(res);
      this.branchForm.patchValue(res);
      if (this.data['action'] === 'edit') {
        this.canEdit = true;
      }
    },
      error => {
        console.log(error.error.message);
      });
  }

  // getter for controls

  get controls() {
    return this.branchForm.controls;
  }

  onSubmit() {
    console.log(this.branchForm.value);
    const partnerData = this.branchForm.value;

    this.branchService.addBranch(partnerData).subscribe(res => {
      // console.log(res);
      if (res) {
        const msg = 'Partner Added Successfully';
        this.toastr.successToastr(msg);
      }
    },
      error => {
        console.log(error.error.message);
        const msg = error.error.message;
        this.toastr.errorToastr(msg);
      });

    //   this.hasFormErrors = false;
    //   this.loadingAfterSubmit = false;
    //   /** check form */
    //   if (!this.isTitleValid()) {
    //     this.hasFormErrors = true;
    //     return;
    //   }
  }

  onAlertClose($event) {
    // this.hasFormErrors = false;
  }

}
