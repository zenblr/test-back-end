import { Component, OnInit } from '@angular/core';
import { CustomerManagementService } from '../../../core/customer-management/services/customer-management.service';

@Component({
  selector: 'kt-customer-management',
  template: `<kt-customer-list *ngIf="toogler=='list'"></kt-customer-list>
                <kt-customer-grid *ngIf="toogler=='grid'"></kt-customer-grid>`,
})
export class CustomerManagementComponent implements OnInit {

  toogler: string
  constructor(
    private customerManagementService: CustomerManagementService,
  ) {
    this.customerManagementService.toggle$.subscribe(res => {
      this.toogler = res;
    })
  }

  ngOnInit() {
  }

}
