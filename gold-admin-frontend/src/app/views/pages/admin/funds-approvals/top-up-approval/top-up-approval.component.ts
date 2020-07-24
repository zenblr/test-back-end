import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { MatPaginator, MatDialog } from '@angular/material';
import { Subject, Subscription, merge } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { map, tap } from 'rxjs/operators';
import { takeUntil, skip, distinctUntilChanged } from 'rxjs/operators';
import { TopUpApprovalDatasource, TopUpApprovalService } from '../../../../../core/funds-approvals'
import { OrnamentsComponent } from '../../../../partials/components/ornaments/ornaments.component';

@Component({
  selector: 'kt-top-up-approval',
  templateUrl: './top-up-approval.component.html',
  styleUrls: ['./top-up-approval.component.scss']
})
export class TopUpApprovalComponent implements OnInit {

  dataSource;
  displayedColumns = ['customerId', 'loanId', 'requestDate', 'fullName', 'mobileNumber', 'loanAmount',
    'loanDate', 'depositAmount', 'outstandingLoan', 'schemeName', 'grossWeight', 'netWeight', 'previousLtv',
    'currentLtv', 'ornamentsDetails', 'eligibleTopUp', 'requestedTopUp', 'interestAmount', 'penalInterest', 'newLoan',
    'netAmount', 'status', 'action'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private dataTableService: DataTableService,
    private topUpApprovalService: TopUpApprovalService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private layoutUtilsService: LayoutUtilsService,
  ) { }

  ngOnInit() {
    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => this.loadPage())
    ).subscribe();
    this.subscriptions.push(paginatorSubscriptions);


    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadPage();
      });

    this.dataSource = new TopUpApprovalDatasource(this.topUpApprovalService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.result = res;
    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.getDepositList(1, 25, this.searchValue);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  loadPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.getDepositList(from, to, this.searchValue);
  }

  ornamentsDetails() {
    this.dialog.open(OrnamentsComponent, { 
      data: {
        modal:true
      } , 
      width: '90%' 
    })
  }

}
