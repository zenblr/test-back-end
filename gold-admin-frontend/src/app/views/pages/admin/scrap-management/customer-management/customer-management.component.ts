import { Component, OnInit, OnChanges } from '@angular/core';
import { CustomerManagementDatasource, ScrapCustomerManagementService } from '../../../../../core/scrap-management';
import { skip, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subscription, Subject } from 'rxjs';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';

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
    page = { from: 1, to: 20, search: '' }
    customerResult = [];
    unsubscribeSearch$ = new Subject();
    searchValue: string = '';
    constructor(
        private scrapCustomerManagementService: ScrapCustomerManagementService,
        private dataTableService: DataTableService
    ) {
        this.scrapCustomerManagementService.toggle$.subscribe(res => {
            this.toogler = res;
        })
    }

    ngOnInit() {
        // Init DataSource
        this.dataSource = new CustomerManagementDatasource(this.scrapCustomerManagementService);
        const entitiesSubscription = this.dataSource.entitySubject.pipe(
            skip(1),
            distinctUntilChanged()
        ).subscribe(res => {
            this.customerResult = res;
        });
        this.subscriptions.push(entitiesSubscription);
        this.dataSource.isPreloadTextViewed$.subscribe(res => {
            this.isPreloadTextViewed = res
        })
        // // First load
        // this.loadLeadsPage();

        // count

        this.dataSource.loadList(this.searchValue, 1, 25);
    }

    ngOnChanges() {
    }

    loadCustomers(event) {
        // console.log(event)
        this.dataSource.loadList(event.search, event.from, event.to);
        this.page.from = event.from;
        this.page.to = event.to;
        this.page.search = event.search;
    }

    ngOnDestroy() {
        this.subscriptions.forEach(el => el.unsubscribe());
    }



}
