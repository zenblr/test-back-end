import { Component, OnInit, ViewChild } from '@angular/core';
import { AppliedKycDatasource } from '../../../../core/applied-kyc/datasources/applied-kyc.datasource';
import { AppliedKycService } from '../../../../core/applied-kyc/services/applied-kyc.service';
import { MatPaginator, MatSort, MatDialog, MatTooltipModule, TooltipPosition } from '@angular/material';
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
  displayedColumns = ['fullName', 'pan', 'customerId', 'currentProduct', 'date', 'cceApprovalStatus', 'kycStatus', 'scrapCceApprovalStatus', 'scrapKycStatus', 'allowToEdit', 'action', 'view'];
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
    scrapKycStatusFromCce: '',
    scrapKycStatus: '',
    modulePoint: ''
  }
  permission: any;

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
      this.permission = res;
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
      this.leadsResult = res;
    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.loadKyc(this.queryParamsData);
  }

  loadPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    this.queryParamsData.from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    this.queryParamsData.to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadKyc(this.queryParamsData);
  }

  applyFilter(data) {
    this.queryParamsData.cceStatus = data.data.cceStatus;
    this.queryParamsData.kycStatus = data.data.kycStatus;
    this.queryParamsData.scrapKycStatusFromCce = data.data.scrapKycStatusFromCce;
    this.queryParamsData.scrapKycStatus = data.data.scrapKycStatus;
    this.queryParamsData.modulePoint = data.data.modulePoint;
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
        const disabled = (res.customerKycReview.customerKyc.currentKycModuleId == 1 && res.customerKycReview.scrapKycStatus === 'approved') ? true : false
        this.router.navigate(['/admin/kyc-setting/edit-kyc'], { queryParams: { disabled } });
      })
    ).subscribe();
  }

  assign(item) {
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
    this.router.navigate(['/admin/loan-management/loan-transfer'], { queryParams: { customerID: loan.customer.customerUniqueId } })
  }

  applyLoan(loan) {
    this.router.navigate(['/admin/loan-management/loan-application-form/'], { queryParams: { customerID: loan.customer.customerUniqueId } })
  }

  applyScrap(scrap) {
    this.router.navigate(['/admin/scrap-management/scrap-buying-application-form/'], { queryParams: { customerID: scrap.customer.customerUniqueId } })
  }

  allowToEdit(data) {
    this.appliedKycService.changeKYCEditable(data).subscribe()
  }
}
