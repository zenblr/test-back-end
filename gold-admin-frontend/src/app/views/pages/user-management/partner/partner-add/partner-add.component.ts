// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from '../../../material/popups-and-modals/dialog/dialog.component';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// Services
import { PartnerService } from '../../../../../core/user-management/partner/services/partner.service';
import { ToastrService } from 'ngx-toastr';
import { ToastrComponent } from '../../../../../views/partials/components/toastr/toastr.component';

@Component({
  selector: 'kt-partner-add',
  templateUrl: './partner-add.component.html',
  styleUrls: ['./partner-add.component.scss']
})
export class PartnerAddComponent implements OnInit {

  // role: Role;
  // role$: Observable<Role>;
  // hasFormErrors = false;
  // viewLoading = false;
  // loadingAfterSubmit = false;
  // allPermissions$: Observable<Permission[]>;
  // rolePermissions: Permission[] = [];
  // // Private properties
  // private componentSubscriptions: Subscription;

  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  partnerForm: FormGroup;
  // states: any;
  // cities: any;
  states = [
    { id: 1, name: 'maharashtra' },
    { id: 2, name: 'Goa' },
    { id: 3, name: 'punjab' },
  ];
  cities = [
    { id: 1, name: 'maharashtra' },
    { id: 2, name: 'Goa' },
    { id: 3, name: 'punjab' },
  ];

  constructor(
    public dialogRef: MatDialogRef<PartnerAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private partnerService: PartnerService,
  ) { }

  ngOnInit() {
    this.formInitialize();
    // this.getStates();
  }

  formInitialize() {
    this.partnerForm = this.fb.group({
      partnerName: ['', [Validators.required]],
      partnerId: ['', [Validators.required]],
      commission: ['', [Validators.required]],
      state: ['', [Validators.required]],
      city: ['', [Validators.required]],
      address: ['', [Validators.required]],
    });
  }

  getStates() {
    this.sharedService.getStates().subscribe(res => {
      console.log(res);
      // this.states = res;
    },
      error => {
        console.error(error);
      });
  }

  getCities() {
    const stateId = this.controls.state.value;
    console.log(stateId);
    this.sharedService.getCities(stateId).subscribe(res => {
      console.log(res);
      // this.cities = res;
    },
      error => {
        console.error(error);
      });
  }

  // getter for controls

  get controls() {
    return this.partnerForm.controls;
  }

  onSubmit() {
    console.log(this.partnerForm.value);
    const partnerData = this.partnerForm.value;

    this.partnerService.addPartner(partnerData).subscribe(res => {
      // console.log(res);
      if (res) {
        const msg = 'Partner Added Successfully';
        this.toastr.successToastr(msg);
      }
    },
      error => {
        console.log(error);
        const msg = 'Partner Added Successfully';
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

  // getTitle(): string {
  //   if (this.role && this.role.id) {
  //     // tslint:disable-next-line:no-string-throw
  //     return `Edit role '${this.role.title}'`;
  //   }

  //   // tslint:disable-next-line:no-string-throw
  //   return 'New role';
  // }

	/**
	 * Returns is title valid
	 */
  // isTitleValid(): boolean {
  //   return (this.role && this.role.title && this.role.title.length > 0);
  // }

}
