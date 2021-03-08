import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SharedService } from '../../../core/shared/services/shared.service';

@Component({
  selector: 'kt-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss']
})
export class OtpComponent implements OnInit {
  user = []
  partner = []
  customer = []
  constructor(
    private sharedService: SharedService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.sharedService.getOtp().subscribe(res => {
      this.user = res.data.userOtp
      this.partner = res.data.partnerBranchOtp
      this.customer = res.data.customerOtp
      this.ref.detectChanges()

    })
  }

}
