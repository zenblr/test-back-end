import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef, AfterViewInit, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PacketsService } from '../../../../../../core/loan-management/packet/services/packets.service';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { AppraiserService } from '../../../../../../core/user-management/appraiser';

import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'kt-assign-packets',
  templateUrl: './assign-packets.component.html',
  styleUrls: ['./assign-packets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignPacketsComponent implements OnInit, AfterViewInit {

  @ViewChild('tabGroup', { static: false }) tabGroup;
  packetForm: FormGroup;
  title: string;
  branches = [];
  details: any;
  appraisers: any;
  csvForm: FormGroup;
  file: any;

  constructor(
    public dialogRef: MatDialogRef<AssignPacketsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private packetsService: PacketsService,
    private sharedService: SharedService,
    private appraiserService: AppraiserService,
    private ref: ChangeDetectorRef,
    private ele: ElementRef
  ) {
    this.details = this.sharedService.getDataFromStorage()
  }

  ngOnInit() {
    this.getInternalBranhces();
    this.initForm();
    this.setForm();
  }


  setForm() {
    if (this.data.action == 'add') {
      this.title = 'Add New Packet'
    } else if (this.data.action == 'edit') {
      this.getAllAppraiser()
      this.title = 'Edit Packet'
      this.packetForm.patchValue(this.data.packetData);
      if (this.controls.appraiserId.value) {
        this.controls.appraiserId.setValidators([Validators.required])
        this.controls.appraiserId.updateValueAndValidity()
      } else {
        this.controls.appraiserId.setValidators([])
        this.controls.appraiserId.updateValueAndValidity()
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.data.action == 'edit') {
      const matLabel = this.ele.nativeElement.querySelector('.mat-tab-header') as HTMLElement
      matLabel.style.display = "none"
      this.ref.detectChanges()
    }
  }

  initForm() {
    this.packetForm = this.fb.group({
      id: [],
      packetUniqueId: ['', [Validators.required]],
      internalUserBranch: ['', [Validators.required]],
      appraiserId: [],
      barcodeNumber: ['', [Validators.required]]
    })

    this.csvForm = this.fb.group({
      internalUserBranch: ['', [Validators.required]],
      csv: ['', Validators.required]
    })
  }

  action(event) {
    if (event) {
      this.onSubmit();
    } else if (!event) {
      this.dialogRef.close();
    }
  }

  onSubmit() {
    console.log(this.tabGroup.selectedIndex)
    if (this.tabGroup.selectedIndex == 0) {
      if (this.packetForm.invalid) {
        this.packetForm.markAllAsTouched()
        return
      }
      // console.log(this.packetForm.value);
      const packetUniqueId = this.packetForm.get('packetUniqueId').value;
      // console.log(packetUniqueId.toLowerCase());
      this.packetForm.controls.packetUniqueId.patchValue(packetUniqueId.toLowerCase());
      if (this.controls.appraiserId.value) {
        this.packetForm.patchValue({ appraiserId: Number(this.controls.appraiserId.value) })
      } else {
        this.packetForm.patchValue({ appraiserId: null })
      }
      this.controls.internalUserBranch.patchValue(Number(this.controls.internalUserBranch.value))
      const partnerData = this.packetForm.value;
      const id = this.controls.id.value;

      if (this.data.action == 'edit') {
        this.packetsService.updatePacket(id, partnerData).subscribe(res => {
          // console.log(res);
          if (res) {
            const msg = 'Packet Updated Sucessfully';
            this.toastr.success(msg);
            this.dialogRef.close(true);
          }
        });

      } else {
        this.packetsService.addPacket(partnerData).subscribe(res => {
          // console.log(res);
          if (res) {
            const msg = 'Packet Added Successfully';
            this.toastr.success(msg);
            this.dialogRef.close(true);
          }
        });
      }
    } else
      if (this.tabGroup.selectedIndex == 1) {
        if (this.csvForm.invalid) {
          this.csvForm.markAllAsTouched()
          return
        }
        var fb = new FormData()
        fb.append('packetcsv', this.file)
        fb.append('internalUserBranch', this.csvForm.controls.internalUserBranch.value)
        console.log(fb)
        this.packetsService.uplaodCSV(fb).pipe(
          map((res) => {
            this.toastr.success('Packets Created Sucessfully');
            this.dialogRef.close(res);
          }), catchError(err => {

            this.ref.detectChanges();
            throw (err)
          })).subscribe()
      }
  }

  getFileInfo(event) {
    this.file = event.target.files[0];
    var ext = event.target.files[0].name.split('.');
    if (ext[ext.length - 1] != 'csv') {
      this.toastr.error('Please upload csv file');
      this.csvForm.controls.csv.markAsTouched()
      return
    }
    this.csvForm.get('csv').patchValue(event.target.files[0].name);

  }

  get controls() {
    return this.packetForm.controls;
  }

  getInternalBranhces() {
    this.packetsService.getInternalBranhces().subscribe(res => {
      this.branches = res.data;
      this.ref.detectChanges()
    });
  }

  getAllAppraiser(branchId = null) {
    if (this.data.packetData && this.data.packetData.internalUserBranch) {

      const selectedBranchId = branchId ? branchId : this.data.packetData.internalUserBranch

      this.appraiserService.getAllAppraiser(selectedBranchId).subscribe(res => {
        this.appraisers = res.data;
        this.ref.markForCheck()
      })
    }
  }

  changeBranch(event) {
    let branchId = event.target.value
    // this.controls.appraiserId.reset()
    this.controls.appraiserId.patchValue('')
    this.getAllAppraiser(branchId)
  }
}
