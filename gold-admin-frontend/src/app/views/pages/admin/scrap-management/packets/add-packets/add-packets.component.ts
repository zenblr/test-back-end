import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ScrapPacketsService } from '../../../../../../core/scrap-management';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { map, catchError } from 'rxjs/operators';


@Component({
  selector: 'kt-add-packets',
  templateUrl: './add-packets.component.html',
  styleUrls: ['./add-packets.component.scss']
})
export class AddPacketsComponent implements OnInit {
  @ViewChild('tabGroup', { static: false }) tabGroup;

  packetForm: FormGroup;
  csvForm: FormGroup;
  title: string;
  branches = [];
  details: any;
  file: any;


  constructor(
    public dialogRef: MatDialogRef<AddPacketsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private scrapPacketsService: ScrapPacketsService,
    private sharedService: SharedService,
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
      this.title = 'Add Packet';
    } else if (this.data.action == 'edit') {
      this.title = 'Edit Packet';
      this.packetForm.patchValue(this.data.packetData);
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
      internalUserBranchId: ['', [Validators.required]],
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
    if (this.tabGroup.selectedIndex == 0) {

      if (this.packetForm.invalid) {
        this.packetForm.markAllAsTouched();
        return;
      }
      const packetUniqueId = this.packetForm.get('packetUniqueId').value;
      this.packetForm.controls.packetUniqueId.patchValue(packetUniqueId.toLowerCase());
      const partnerData = this.packetForm.value;
      const id = this.controls.id.value;

      if (this.data.action == 'edit') {
        this.scrapPacketsService.updatePacket(id, partnerData).subscribe(res => {
          if (res) {
            const msg = 'Packet Updated Sucessfully';
            this.toastr.success(msg);
            this.dialogRef.close(true);
          }
        });
      } else {
        this.scrapPacketsService.addPacket(partnerData).subscribe(res => {
          if (res) {
            const msg = 'Packet Added Successfully';
            this.toastr.success(msg);
            this.dialogRef.close(true);
          }
        });
      }
    } else {
      if (this.tabGroup.selectedIndex == 1) {
        if (this.csvForm.invalid) {
          this.csvForm.markAllAsTouched()
          return
        }
        var fb = new FormData()
        fb.append('packetcsv', this.file)
        fb.append('internalUserBranch', this.csvForm.controls.internalUserBranch.value)
        console.log(fb)
        this.scrapPacketsService.uplaodCSV(fb).pipe(
          map((res) => {
            this.toastr.success('Packets Created Sucessfully');
            this.dialogRef.close(res);
          }), catchError(err => {
            this.ref.detectChanges();
            throw (err)
          })).subscribe()
      }
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
    this.scrapPacketsService.getInternalBranhces().subscribe(res => {
      this.branches = res.data;
    });
  }
}
