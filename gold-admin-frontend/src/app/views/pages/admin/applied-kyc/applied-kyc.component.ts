import { Component, OnInit, ViewChild } from '@angular/core';
import { AppliedKycDatasource } from '../../../../core/applied-kyc/datasources/applied-kyc.datasource';
import { AppliedKycService } from '../../../../core/applied-kyc/services/applied-kyc.service';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subject, Subscription, merge } from 'rxjs';
import { tap, takeUntil, skip, distinctUntilChanged, map } from 'rxjs/operators';
import { DataTableService } from '../../../../core/shared/services/data-table.service';
import { Router } from '@angular/router';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { UserReviewComponent } from '../kyc-settings/tabs/user-review/user-review.component';
import { NgxPermissionsService } from 'ngx-permissions';
import { AddAppraiserComponent } from '../user-management/assign-appraiser/add-appraiser/add-appraiser.component';

@Component({
  selector: 'kt-applied-kyc',
  templateUrl: './applied-kyc.component.html',
  styleUrls: ['./applied-kyc.component.scss']
})
export class AppliedKycComponent implements OnInit {

  dataSource: AppliedKycDatasource;
  displayedColumns = ['fullName', 'pan', 'date', 'cceApprovalStatus', 'kycStatus', 'action', 'view', 'appraiser', 'appraiserName', 'customerId'];
  leadsResult = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  searchValue = '';
  private subscriptions: Subscription[] = [];

  private unsubscribeSearch$ = new Subject();
  userType;
  private destroy$ = new Subject();

  constructor(
    private appliedKycService: AppliedKycService,
    public dialog: MatDialog,
    private dataTableService: DataTableService,
    private router: Router,
    private sharedService: SharedService,
    private ngxPermissionsService: NgxPermissionsService
  ) {
    let res = this.sharedService.getDataFromStorage()
    this.userType = res.userDetails.userTypeId;
  }

  ngOnInit() {
    // const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    // this.subscriptions.push(sortSubscription);

    this.ngxPermissionsService.permissions$.subscribe(res => {
      console.log(res);
    })

    const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
      tap(() => {
        this.loadPage();
      })
    )
      .subscribe();
    this.subscriptions.push(paginatorSubscriptions);

    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadPage();
      });

    // Init DataSource
    this.dataSource = new AppliedKycDatasource(this.appliedKycService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      console.log(res);
      this.leadsResult = res;
    });
    this.subscriptions.push(entitiesSubscription);

    // First load
    // this.loadLeadsPage();

    this.dataSource.loadKyc(1, 25, this.searchValue, '', '', '');
  }

  loadPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadKyc(from, to, this.searchValue, '', '', '');
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  editKyc(data) {
    // console.log(data.customerId, data.id);
    const params = { customerId: data.customerId, customerKycId: data.id };
    this.appliedKycService.editKycDetails(params).pipe(
      map(res => {
        console.log(res);
        this.appliedKycService.editKyc.next({ editable: true });
        this.router.navigate(['/admin/kyc-setting/edit-kyc']);
      })
    ).subscribe();
  }

  assign() {
    // this.router.navigate(['/admin/user-management/redirect-assign-appraiser'])
    const dialogRef = this.dialog.open(AddAppraiserComponent, { data: { action: 'add' }, width: '500px' });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

  updateAppraiser(item) {
    const dialogRef = this.dialog.open(AddAppraiserComponent, { data: { action: 'edit', appraiser: item.customer.customerAssignAppraiser }, width: '500px' });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

  viewKYC(data) {
    // this.dialog.open(UserReviewComponent)
    const params = { customerId: data.customerId, customerKycId: data.id };
    this.appliedKycService.editKycDetails(params).subscribe(res => {
      console.log(res)
      const dialogRef = this.dialog.open(UserReviewComponent, { data: { action: 'view' }, width: '900px' });
    })
  }
}
