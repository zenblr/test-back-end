import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator, MatDialog } from '@angular/material';
import { Subscription, Subject } from 'rxjs';
import { MonthlyRepaymentDatasource } from '../../../../core/repayment/datasources/monthly-repayment.datasource';
import { LayoutUtilsService } from '../../../../core/_base/crud';
import { DataTableService } from '../../../../core/shared/services/data-table.service';
import { Router } from '@angular/router';
import { MonthlyService } from '../../../../core/repayment/services/monthly.service';
import { takeUntil, skip, distinctUntilChanged } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { MonthlyPaymentAddComponent } from '../monthly-payment-add/monthly-payment-add.component';

@Component({
  selector: 'kt-monthly-payment',
  templateUrl: './monthly-payment.component.html',
  styleUrls: ['./monthly-payment.component.scss']
})
export class MonthlyPaymentComponent implements OnInit {

  // Table fields
  dataSource: MonthlyRepaymentDatasource;
  displayedColumns = ['loanId', 'loanAmount', 'loanStartDate', 'loanEndDate', 'status', 'actions'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  // Filter fields
  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  private subscriptions: Subscription[] = [];
  monthlyPaymentResult = [];
  private destroy$ = new Subject();
  private unsubscribeSearch$ = new Subject();

  searchValue = '';

  constructor(
    public dialog: MatDialog,
    private layoutUtilsService: LayoutUtilsService,
    private monthlyService: MonthlyService,
    private dataTableService: DataTableService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.monthlyService.openModal$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res) {
        this.addPayment();
      }
    })
  }

  ngOnInit() {
    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadPage();
      });

    // Init DataSource
    this.dataSource = new MonthlyRepaymentDatasource(this.monthlyService);
    // console.log(this.dataSource);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.monthlyPaymentResult = res;
    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.loadPartners(this.searchValue, 1, 25, '', '', '');
  }

  loadPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadPartners(this.searchValue, from, to, '', '', '');
  }

  addPayment() {
    console.log('add')
    const dialogRef = this.dialog.open(MonthlyPaymentAddComponent, { data: { action: 'add' }, width: '450px' });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    })
    this.monthlyService.openModal.next(false);
  }

  editItem(role) {
    const dialogRef = this.dialog.open(MonthlyPaymentAddComponent, {
      data: { paymentId: role.id, action: 'edit' },
      width: '450px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

  viewItem(role) {
    const dialogRef = this.dialog.open(MonthlyPaymentAddComponent, {
      data: { partnerId: role.id, action: 'view' },
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }
    });
  }

  deleteItem(_item) {
    const role = _item;
    const _title = 'Delete Payment Details';
    const _description = 'Are you sure to permanently delete this payment details?';
    const _waitDesciption = 'Payment Details is deleting...';
    const _deleteMessage = `Payment Details has been deleted`;

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        console.log(res);
        // this.monthlyService.deletePartner(role.id).subscribe(successDelete => {
        //   this.toastr.success(_deleteMessage);
        //   this.loadPage();
        // },
        //   errorDelete => {
        //     this.toastr.error(errorDelete.error.message);
        //   });
      }
    });
  }

}
