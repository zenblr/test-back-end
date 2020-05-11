import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subscription, merge, Subject, from } from 'rxjs';
import { tap, distinctUntilChanged, skip, takeUntil, map } from 'rxjs/operators';
import { DataTableService } from '../../../../core/shared/services/data-table.service';
import { AppliedLoanDatasource,AppliedLoanService } from '../../../../core/loan-management'
@Component({
  selector: 'kt-applied-loan',
  templateUrl: './applied-loan.component.html',
  styleUrls: ['./applied-loan.component.scss']
})
export class AppliedLoanComponent implements OnInit {

  dataSource: AppliedLoanDatasource;
  displayedColumns = ['fullName','customerID', 'mobile', 'pan', 'date', 'schemeName', 'appraisalApproval', 'bMApproval', 'actions'];
  leadsResult = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  // Filter fields
  // @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  // @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  destroy$ = new Subject();

  // Subscriptions
  private subscriptions: Subscription[] = [];
  private unsubscribeSearch$ = new Subject();
  searchValue = '';

  constructor(
    public dialog: MatDialog,
    private AppliedLoanService: AppliedLoanService,
    private dataTableService: DataTableService
  ) {
  }

  ngOnInit() {
    

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

    this.dataSource.loadAppliedLoans(this.searchValue,1, 25);

  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  loadAppliedLoansPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadAppliedLoans(this.searchValue,from, to);
  }

  // addLead() {
  //   // console.log(event);
  //   const dialogRef = this.dialog.open(AddLeadComponent, {
  //     data: { action: 'add' },
  //     width: '500px'
  //   });
  //   dialogRef.afterClosed().subscribe(res => {
  //     if (res) {
  //       this.loadLeadsPage();
  //     }
  //     this.loanManagementService.openModal.next(false);
  //   });
  // }

  // editLead(role) {
  //   const dialogRef = this.dialog.open(AddLeadComponent,
  //     {
  //       data: { id: role.id, action: 'edit' },
  //       width: '500px'
  //     });
  //   dialogRef.afterClosed().subscribe(res => {
  //     if (res) {
  //       this.loadLeadsPage();
  //     }
  //   });
  // }
}