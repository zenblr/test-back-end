import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { ToastrComponent } from '../../../partials/components/toastr/toastr.component';
import { Subscription, merge, Subject } from 'rxjs';
import { tap, distinctUntilChanged, skip, takeUntil, map } from 'rxjs/operators';
import { AddLeadComponent } from './add-lead/add-lead.component';
import { DataTableService } from '../../../../core/shared/services/data-table.service';
import { Router } from '@angular/router';
import { LeadManagementDatasource } from '../../../../core/lead-management/datasources/lead.datasources';
import { LeadService } from '../../../../core/lead-management/services/lead.service';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { AssignAppraiserComponent } from '../user-management/assign-appraiser/assign-appraiser/assign-appraiser.component';
import { NewRequestAddComponent } from './new-request-add/new-request-add.component';

@Component({
  selector: 'kt-lead-management',
  templateUrl: './lead-management.component.html',
  styleUrls: ['./lead-management.component.scss']
})
export class LeadManagementComponent implements OnInit {

  dataSource: LeadManagementDatasource;
  displayedColumns = ['fullName', 'pan', 'internalBranch', 'state', 'city', 'pincode', 'date', 'status', 'kycStatus', 'kyc', 'actions', 'view', 'appraiser', 'menu'];
  leadsResult = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  queryParamsData = {
    from: 1,
    to: 25,
    search: '',
    stageName: 'lead',
    stateId: '',
    cityId: '',
    statusId: '',
  }
  // Filter fields
  // @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  destroy$ = new Subject();
  filter$ = new Subject();

  // Subscriptions
  private subscriptions: Subscription[] = [];

  stageName = 'lead'
  private unsubscribeSearch$ = new Subject();
  searchValue = '';
  filteredDataList = {};

  constructor(
    public dialog: MatDialog,
    private leadService: LeadService,
    private dataTableService: DataTableService,
    private router: Router,
    private sharedService: SharedService
  ) {
    this.leadService.openModal$.pipe(
      map(res => {
        if (res) {
          this.addLead();
        }
      }),
      takeUntil(this.destroy$)).subscribe();

    this.leadService.applyFilter$
      .pipe(takeUntil(this.filter$))
      .subscribe((res) => {
        if (Object.entries(res).length) {
          this.applyFilter(res);
        }
      });
  }

  ngOnInit() {

    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => this.loadLeadsPage())
    ).subscribe();
    this.subscriptions.push(paginatorSubscriptions);


    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.queryParamsData.search = res;
        this.paginator.pageIndex = 0;
        this.loadLeadsPage();
      });

    // Init DataSource
    this.dataSource = new LeadManagementDatasource(this.leadService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.leadsResult = res;
    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.loadLeads(this.queryParamsData);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
    this.filter$.next();
    this.filter$.complete();
    this.leadService.applyFilter.next({});
    this.sharedService.closeFilter.next(true);
  }


  loadLeadsPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    this.queryParamsData.from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    this.queryParamsData.to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadLeads(this.queryParamsData);
  }

  applyFilter(data) {
    console.log(data);
    this.queryParamsData.cityId = data.data.cities;
    this.queryParamsData.stateId = data.data.states;
    this.queryParamsData.statusId = data.data.leadStatus;
    this.dataSource.loadLeads(this.queryParamsData);
    this.filteredDataList = data.list;
  }

  addLead() {
    // console.log(event);
    const dialogRef = this.dialog.open(AddLeadComponent, {
      data: { action: 'add' },
      width: '500px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadLeadsPage();
      }
      this.leadService.openModal.next(false);
    });
  }

  editLead(role) {
    const dialogRef = this.dialog.open(AddLeadComponent,
      {
        data: { id: role.id, action: 'edit' },
        width: '500px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadLeadsPage();
      }
    });
  }


  viewLead(role) {
    const dialogRef = this.dialog.open(AddLeadComponent,
      {
        data: { id: role.id, action: 'view' },
        width: '500px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadLeadsPage();
      }
    });
  }

  goToKyc(data) {
    console.log(data)
    var mobile = '';
    this.leadService.getLeadById(data.id).pipe(
      map(res => {
        mobile = res.singleCustomer.mobileNumber
        this.router.navigate(['/admin/kyc-setting'], { queryParams: { mob: mobile } });
      }))
      .subscribe();
  }

  assign(item) {
    // this.router.navigate(['/admin/user-management/redirect-assign-appraiser'])
    item.customer = { firstName: item.firstName, lastName: item.lastName }
    const dialogRef = this.dialog.open(AssignAppraiserComponent, { data: { action: 'add', from: 'lead', customer: item.customer, id: item.id }, width: '500px' });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadLeadsPage();
      }
    });
  }

  updateAppraiser(item) {
    item.customer = { firstName: item.firstName, lastName: item.lastName }
    item.customer.customerUniqueId = item.customerUniqueId
    const dialogRef = this.dialog.open(AssignAppraiserComponent, { data: { action: 'edit', from: 'lead', appraiser: item.customerAssignAppraiser, customer: item.customer, id: item.id }, width: '500px' });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadLeadsPage();
      }
    });
  }

  newRequest(loan) {
    console.log(loan)
    const dialogRef = this.dialog.open(NewRequestAddComponent, { data: { action: 'add', leadData: loan }, width: '500px' });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadLeadsPage();
      }
    });
  }

}
