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
import { AssignAppraiserComponent } from '../user-management/assign-appraiser/assign-appraiser/assign-appraiser.component';

@Component({
  selector: 'kt-applied-kyc',
  templateUrl: './applied-kyc.component.html',
  styleUrls: ['./applied-kyc.component.scss']
})
export class AppliedKycComponent implements OnInit {

  filteredDataList: any = {};
  dataSource: AppliedKycDatasource;
  displayedColumns = ['fullName', 'pan', 'customerId', 'appraiserName', 'date', 'cceApprovalStatus', 'kycStatus', 'action', 'view', 'appraiser', 'menu'];
  leadsResult = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  searchValue = '';
  private subscriptions: Subscription[] = [];
  private unsubscribeSearch$ = new Subject();
  userType;
  private destroy$ = new Subject();
  private filter$ = new Subject();
  queryParamsData = {
    from: 1,
    to: 25,
    search: '',
    cceStatus: '',
    kycStatus: '',
  }

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

    this.appliedKycService.applyFilter$
      .pipe(takeUntil(this.filter$))
      .subscribe((res) => {
        if (Object.entries(res).length) {
          this.applyFilter(res);
        }
      });
  }

  ngOnInit() {
    // const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    // this.subscriptions.push(sortSubscription);

    this.ngxPermissionsService.permissions$.subscribe(res => {
      // console.log(res);
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
        this.queryParamsData.search = res;
        this.paginator.pageIndex = 0;
        this.loadPage();
      });

    // Init DataSource
    this.dataSource = new AppliedKycDatasource(this.appliedKycService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      // console.log(res);
      this.leadsResult = res;
    });
    this.subscriptions.push(entitiesSubscription);

    // First load
    // this.loadLeadsPage();

    this.dataSource.loadKyc(this.queryParamsData);
  }

  loadPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadKyc(this.queryParamsData);
  }

  applyFilter(data) {
    // console.log(data);
    this.queryParamsData.cceStatus = data.data.cceStatus;
    this.queryParamsData.kycStatus = data.data.kycStatus;
    this.dataSource.loadKyc(this.queryParamsData);
    this.filteredDataList = data.list;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
    this.filter$.next();
    this.filter$.complete();
    this.appliedKycService.applyFilter.next({});
    this.sharedService.closeFilter.next(true);
  }

  editKyc(data) {
    // console.log(data.customerId, data.id);
    const params = { customerId: data.customerId, customerKycId: data.id };
    this.appliedKycService.editKycDetails(params).pipe(
      map(res => {
        // console.log(res);
        this.appliedKycService.editKyc.next({ editable: true });
        this.router.navigate(['/admin/kyc-setting/edit-kyc']);
      })
    ).subscribe();
  }

  assign(item) {
    // this.router.navigate(['/admin/user-management/redirect-assign-appraiser'])
    const dialogRef = this.dialog.open(AssignAppraiserComponent, { data: { action: 'add', customer: item.customer, id: item.customerId }, width: '500px' });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

  updateAppraiser(item) {
    const dialogRef = this.dialog.open(AssignAppraiserComponent, { data: { action: 'edit', appraiser: item.customer.customerAssignAppraiser, customer: item.customer }, width: '500px' });
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
      // console.log(res)
      const dialogRef = this.dialog.open(UserReviewComponent, { data: { action: 'view' }, width: '900px' });
    })
  }

  transferLoan(loan) {
    this.router.navigate(['/admin/laon-management/loan-transfer'])
  }

  applyLoan(loan) {
    this.router.navigate(['/admin/loan-management/loan-application-form/'], { queryParams: { customerID: loan.customerUniqueId } })
  }
}
