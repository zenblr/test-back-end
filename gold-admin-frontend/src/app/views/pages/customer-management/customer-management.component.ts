import { Component, OnInit, OnChanges } from '@angular/core';
import { CustomerManagementService } from '../../../core/customer-management/services/customer-management.service';
import { CustomerManagementDatasource } from '../../../core/customer-management';
import { skip, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'kt-customer-management',
  template: `<kt-customer-list *ngIf="toogler=='list'" [data]="customerResult"
  [isPreloadTextViewed]="isPreloadTextViewed" [hasItems]="dataSource.hasItems" 
  (pagination)="loadCustomers($event)" [paginatorTotal]="this.dataSource.paginatorTotal$ | async ">
  </kt-customer-list>

  <kt-customer-grid *ngIf="toogler=='grid'" (pagination)="loadCustomers($event)"
   [page]="page" [data]="customerResult"></kt-customer-grid>`,
})
export class CustomerManagementComponent implements OnInit, OnChanges {

  isPreloadTextViewed: boolean = true
  prevFrom: 0;
  prevTo: 0;
  toogler: string
  dataSource: CustomerManagementDatasource;
  private subscriptions: Subscription[] = [];
  page = {from:1,to:20}
  customerResult = [];
  constructor(
    private customerManagementService: CustomerManagementService,
  ) {
    this.customerManagementService.toggle$.subscribe(res => {
      this.toogler = res;
    })
  }

  ngOnInit() {
    // Init DataSource
    this.dataSource = new CustomerManagementDatasource(this.customerManagementService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.customerResult = res;
      console.log(this.dataSource.hasItems)
    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.isPreloadTextViewed$.subscribe(res => {
      this.isPreloadTextViewed = res
      console.log(res)
    })
    // // First load
    // this.loadLeadsPage();

    // count

    this.dataSource.getCustomers(1, 20, '');
  }

  ngOnChanges() {
    // this.customerData(from,to,search)
  }

  loadCustomers(event) {
    this.dataSource.getCustomers(event.from, event.to, '');
    this.page.from = event.from;
    this.page.to = event.to;

  }
 
  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
  }



}
