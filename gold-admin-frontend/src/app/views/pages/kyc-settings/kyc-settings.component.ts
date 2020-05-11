import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgbNavChangeEvent, NgbNav } from '@ng-bootstrap/ng-bootstrap';
import { AppliedKycService } from '../../../core/applied-kyc/services/applied-kyc.service';

@Component({
  selector: 'kt-kyc-settings',
  templateUrl: './kyc-settings.component.html',
  styleUrls: ['./kyc-settings.component.scss']
})
export class KycSettingsComponent implements OnInit {

  active = 1;
  disabled: boolean[] = [false, true, true, true, true, true];
  // disabled: boolean[] = [false, false, false, false, false, false]; // delete this line
  @ViewChild('NgbNav', { static: true }) nav: NgbNav;

  constructor(
    private ref: ChangeDetectorRef,
    private appliedKycService: AppliedKycService) { }

  ngOnInit() {
    // this.next();
    // console.log(this.appliedKycService.editKyc.getValue());
    const EDIT_KYC = this.appliedKycService.editKyc.getValue();
    if (EDIT_KYC.editable) {
      this.active = 5;
      for (let index = 0; index < this.disabled.length; index++) {
        this.disabled[index] = true;
      }
      this.disabled[4] = false;
    }
  }

  onNavChange(changeEvent: NgbNavChangeEvent) {
    if (changeEvent.nextId === 3) {
      changeEvent.preventDefault();
    }
  }

  next(event) {

    console.log(event);

    if (event !== true) {
      console.log(event);
      for (let i = 0; i < this.disabled.length; i++) {
        this.disabled[i] = true;
        this.active = +(event);
      }
      this.disabled[+(event) - 1] = false
    } else {
      if (this.active < this.disabled.length) {
        for (let i = 0; i < this.disabled.length; i++) {
          this.disabled[i] = true;
          if (i == this.active) {
            this.disabled[this.active] = !this.disabled[this.active];
          }
        }
        this.active++;
      } else {
        this.active = 1;
        for (let index = 0; index < this.disabled.length; index++) {
          this.disabled[index] = true;
        }
        this.disabled[0] = false;
      }

      this.ref.detectChanges();
    }

  }



}
