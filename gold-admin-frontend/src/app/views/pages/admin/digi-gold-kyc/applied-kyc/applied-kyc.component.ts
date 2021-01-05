import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { merge, Subscription, Subject } from 'rxjs';
import { tap, takeUntil, skip, distinctUntilChanged, map } from 'rxjs/operators';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { Router } from '@angular/router';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { AppliedKycService } from '../../../../../core/digi-gold-kyc/applied-kyc/service/applied-kyc.service';
import { AppliedKycDatasource } from '../../../../../core/digi-gold-kyc/applied-kyc/datasource/applied-kyc.datasource';
import { KycDetailsComponent } from '../kyc-details/kyc-details.component';
import { LeadService } from '../../../../../core/lead-management/services/lead.service';

@Component({
  selector: 'kt-applied-kyc',
  templateUrl: './applied-kyc.component.html',
  styleUrls: ['./applied-kyc.component.scss']
})
export class AppliedKycComponent implements OnInit {

  dataSource: AppliedKycDatasource;
  displayedColumns = ['fullName', 'pan', 'customerId', 'kycStatus', 'action', 'view'];
  leadsResult = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  searchValue = '';
  queryParamsData = {
    from: 1,
    to: 25,
    search: '',
    cceStatus: '',
    kycStatus: '',
    modulePoint: ''
  };
  private subscriptions: Subscription[] = [];
  private unsubscribeSearch$ = new Subject();
  private destroy$ = new Subject();
  private filter$ = new Subject();

  constructor(
    public dialog: MatDialog,
    private dataTableService: DataTableService,
    private router: Router,
    private sharedService: SharedService,
    private appliedKycService: AppliedKycService,
    private leadService: LeadService
  ) { }

  ngOnInit() {

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

  loadPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    this.queryParamsData.from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    this.queryParamsData.to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadKyc(this.queryParamsData);
  }

  applyFilter(data) {
    // this.queryParamsData.cceStatus = data.data.cceStatus;
    // this.queryParamsData.kycStatus = data.data.kycStatus;
    // this.queryParamsData.scrapKycStatusFromCce = data.data.scrapKycStatusFromCce;
    // this.queryParamsData.scrapKycStatus = data.data.scrapKycStatus;
    // this.queryParamsData.modulePoint = data.data.modulePoint;
    // this.dataSource.loadKyc(this.queryParamsData);
    // this.filteredDataList = data.list;
  }

  editKyc(id) {
    // const params = { customerId: data.customerId, customerKycId: data.id };
    // this.appliedKycService.editKycDetails(params).pipe(
    //   map(res => {
    //     this.appliedKycService.editKyc.next({ editable: true });
    //     const disabled = (res.customerKycReview.customerKyc.currentKycModuleId == 1 && res.customerKycReview.scrapKycStatus === 'approved') ? true : false
    //     this.router.navigate(['/admin/kyc-setting/edit-kyc'], { queryParams: { disabled } });
    //   })
    // ).subscribe();

    this.leadService.getLeadById(id).subscribe(res => {
      // console.log(res.singleCustomer)
      // this.appliedKycService.kycData.next(res.singleCustomer)
      this.router.navigate([`/admin/applied-kyc-digi-gold/edit/${id}`]);
    })
  }

  viewKYC(id) {
    this.leadService.getLeadById(id).subscribe(res => {
      console.log(res.singleCustomer)
      // this.appliedKycService.kycData.next(res.singleCustomer)
      const dialogRef = this.dialog.open(KycDetailsComponent, { data: { action: 'view', data: res.singleCustomer }, width: '900px' });
    })
  }
}
