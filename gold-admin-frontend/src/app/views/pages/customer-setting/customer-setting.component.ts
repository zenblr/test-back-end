import { Component, OnInit } from '@angular/core';
import { CustomerManagementService } from '../../../core/customer-management/services/customer-management.service';

@Component({
  selector: 'kt-customer-setting',
  templateUrl: './customer-setting.component.html',
  styleUrls: ['./customer-setting.component.scss']
})
export class CustomerSettingComponent implements OnInit {

  toogler: string
  constructor(
    private customerManagementService: CustomerManagementService,
  ) {
    this.customerManagementService.toggle$.subscribe(res => {
      this.toogler = res;
      console.log(this.toogler)
    })
  }

  ngOnInit() {
  }

}
