import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subscription, merge, Subject, from } from 'rxjs';
import { tap, distinctUntilChanged, skip, takeUntil, map } from 'rxjs/operators';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { AppliedLoanDatasource, AppliedLoanService } from '../../../../../core/loan-management'
import { Router } from '@angular/router';
import { SharedService } from '../../../../../core/shared/services/shared.service';
// import { DisburseDialogComponent } from '../disburse-dialog/disburse-dialog.component';
import { NgxPermissionsService } from 'ngx-permissions';
@Component({
  selector: 'kt-applied-loan',
  templateUrl: './applied-loan.component.html',
  styleUrls: ['./applied-loan.component.scss']
})
export class AppliedLoanComponent implements OnInit {

  filteredDataList: any = {};
  userType: any
  dataSource: AppliedLoanDatasource;
  displayedColumns = ['fullName', 'customerID', 'pan', 'date', 'loanAmount', 'schemeName', 'appraisalApproval', 'bMApproval', 'oTApproval', 'actions', 'view'];
  leadsResult = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  queryParamsData = {
    from: 1,
    to: 25,
    search: '',
    cceStatus: '',
    kycStatus: '',
    appraiserApproval: '',
    loanStageId: ''

  }
  destroy$ = new Subject();

  // Subscriptions
  private subscriptions: Subscription[] = [];
  private unsubscribeSearch$ = new Subject();
  searchValue = '';
  permission: any;
  filter$ = new Subject();
  constructor(
    public dialog: MatDialog,
    private AppliedLoanService: AppliedLoanService,
    private dataTableService: DataTableService,
    private router: Router,
    private sharedService: SharedService,
    private ngxPermission: NgxPermissionsService
  ) {
    this.ngxPermission.permissions$.subscribe(res => {
      this.permission = res
      console.log(res)
    })


    this.AppliedLoanService.applyFilter$
      .pipe(takeUntil(this.filter$))
      .subscribe((res) => {
        if (Object.entries(res).length) {
          this.applyFilter(res);
        }
      });
  }

  ngOnInit() {
    let res = this.sharedService.getDataFromStorage();
    this.userType = res.userDetails.userTypeId

    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => {
        this.loadAppliedLoansPage();
      })
    )
      .subscribe();
    this.subscriptions.push(paginatorSubscriptions);

    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.queryParamsData.search = res;
        this.paginator.pageIndex = 0;
        this.loadAppliedLoansPage();
      });

    // Init DataSource
    this.dataSource = new AppliedLoanDatasource(this.AppliedLoanService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.leadsResult = res;
    });
    this.subscriptions.push(entitiesSubscription);

    // First load
    // this.loadLeadsPage();

    this.dataSource.loadAppliedLoans(this.queryParamsData);

    // this.disburse('data')

  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
    this.filter$.next();
    this.filter$.complete();
    this.AppliedLoanService.applyFilter.next({});
    this.sharedService.closeFilter.next(true);
  }



  loadAppliedLoansPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    this.queryParamsData.from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    this.queryParamsData.to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadAppliedLoans(this.queryParamsData);
  }

  applyFilter(data) {
    console.log(data)
    this.queryParamsData.appraiserApproval = data.data.appraiserStatus;
    this.queryParamsData.loanStageId = data.data.loanStatus;

    this.filteredDataList = data.list;
    this.dataSource.loadAppliedLoans(this.queryParamsData);
  }

  // disburse(loan, masterLoanId) {
  //   // console.log(event);
  //   const dialogRef = this.dialog.open(DisburseDialogComponent, {
  //     data: { loan, masterLoanId },
  //     width: '500px'
  //   });
  //   dialogRef.afterClosed().subscribe(res => {
  //     if (res) {
  //       this.loadAppliedLoansPage();
  //     }
  //   });
  // }

  editLoan(loan) {
    console.log(loan)
    if (loan.loanStage.id == 2 && this.permission.addBmRating) {
      this.navigate(loan)
    }
    else if (loan.loanStage.id == 1 && this.permission.addAppraiserRating) {
      this.navigate(loan)
    }
    else if (loan.loanStage.id == 7 && this.permission.addOpsRating) {
      this.navigate(loan)
    }
    else if (loan.loanStage.id == 8 && this.permission.uploadDocuments) {
      this.packetImageUpload(loan)
    }
    else if (loan.loanStage.id == 3 && this.permission.assignPacket) {
      this.packetImageUpload(loan)
    }
    else if (loan.loanStage.id == 4 && this.permission.loanDisbursement) {
      this.packetImageUpload(loan)
    }
  }

  navigate(loan) {
    this.router.navigate(['/admin/loan-management/loan-application-form', loan.customerLoan[0].id])
  }


  packetImageUpload(loan) {
    this.router.navigate(['/admin/loan-management/packet-image-upload', loan.customerLoan[0].id])
  }

  viewLoan(loan) {
    this.router.navigate(['/admin/loan-management/view-loan', loan.customerLoan[0].id])
  }

}
