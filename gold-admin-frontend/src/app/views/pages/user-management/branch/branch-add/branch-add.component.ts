import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { BranchService } from '../../../../../core/user-management/branch/services/branch.service';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { DialogData } from '../../../material/popups-and-modals/dialog/dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ToastrComponent } from '../../../../../views/partials/components/toastr/toastr.component';
import { PartnerService } from '../../../../../core/user-management/partner/services/partner.service';

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
  partners = [];
  editData = false;
  viewOnly = false;

  constructor(
    public dialogRef: MatDialogRef<BranchAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private branchService: BranchService,
    private partnerService: PartnerService
  ) { }

  ngOnInit() {
    this.formInitialize();
    this.getAllPartners();
    this.getStates();
    console.log(this.data);
    if (this.data['action'] !== 'add') {
      this.getPartnerById(this.data['partnerId']);
    }
  }

  formInitialize() {
    this.branchForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required]],
      partnerId: ['', [Validators.required]],
      stateId: ['', [Validators.required]],
      cityId: ['', [Validators.required]],
      pincode: ['', [Validators.required]],
      address: ['', [Validators.required]],
    });
  }

  getAllPartners() {
    this.partnerService.getAllPartner().subscribe(res => {
      this.partners = res;
    })
  }

  getStates() {
    this.sharedService.getStates().subscribe(res => {
      this.states = res.message;
    },
      error => {
      });
  }

  getCities(event) {
    const stateId = this.controls.stateId.value;
    this.sharedService.getCities(stateId).subscribe(res => {
      this.cities = res.message;
    },
      error => {
      });
  }

  getPartnerById(id) {
    this.branchService.getBranchById(id).subscribe(res => {
      console.log(res);
      this.branchForm.patchValue(res);
      if (this.data['action'] === 'view') {
        this.viewOnly = true;
      }
      if (this.data['action'] === 'edit') {
        this.editData = true;
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
    // console.log(this.branchForm.value);
    const partnerData = this.branchForm.value;
    const id = this.controls.id.value;

    if (this.editData) {
      this.branchService.updateBranch(id, partnerData).subscribe(res => {
        // console.log(res);
        if (res) {
          const msg = 'Branch Updated Sucessfully';
          this.toastr.successToastr(msg);
          this.dialogRef.close(true);
        }
      },
        error => {
          console.log(error.error.message);
          const msg = error.error.message;
          this.toastr.errorToastr(msg);
        });

    } else {
      this.branchService.addBranch(partnerData).subscribe(res => {
        // console.log(res);
        if (res) {
          const msg = 'Partner Added Successfully';
          this.toastr.successToastr(msg);
          this.dialogRef.close(true);
        }
      },
        error => {
          console.log(error.error.message);
          const msg = error.error.message;
          this.toastr.errorToastr(msg);
        });
    }

  }

  onAlertClose($event) {
    // this.hasFormErrors = false;
  }

}
