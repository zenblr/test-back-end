import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription, merge } from 'rxjs';
import { MatPaginator, MatDialog } from '@angular/material';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { map, takeUntil, tap, skip, distinctUntilChanged } from 'rxjs/operators';
import { StandardDeductionDatasource } from '../../../../../../core/masters/standard-deduction/datasources/standard-deduction.datasource';
import { StandardDeductionService } from '../../../../../../core/masters/standard-deduction/service/standard-deduction.service';
import { AddStandardDeductionComponent } from '../add-standard-deduction/add-standard-deduction.component';
import { LayoutUtilsService } from '../../../../../../core/_base/crud/utils/layout-utils.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-standard-deduction-list',
  templateUrl: './standard-deduction-list.component.html',
  styleUrls: ['./standard-deduction-list.component.scss']
})
export class StandardDeductionListComponent implements OnInit {
  dataSource: StandardDeductionDatasource;
  displayedColumns = ['standardDeduction', 'action'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private dataTableService: DataTableService,
    private standardDeductionService: StandardDeductionService,
    public dialog: MatDialog,
    private layoutUtilsService: LayoutUtilsService,
    private toastr: ToastrService
  ) {
    this.standardDeductionService.openModal$.pipe(
      map(res => {
        if (res) {
          this.addStandardDeduction();
        }
      }),
      takeUntil(this.destroy$)).subscribe();
  }

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

    this.dataSource = new StandardDeductionDatasource(this.standardDeductionService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.result = res;
    });
    this.subscriptions.push(entitiesSubscription);
    this.dataSource.getAllStandardDeduction(1, 25, this.searchValue);
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
    this.dataSource.getAllStandardDeduction(from, to, this.searchValue);
  }

  addStandardDeduction() {
    const dialogRef = this.dialog.open(AddStandardDeductionComponent, {
      data: { action: 'add' },
      width: '450px',
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
      this.standardDeductionService.openModal.next(false);
    });
  }

  editStandardDeduction(item) {
    const dialogRef = this.dialog.open(AddStandardDeductionComponent,
      {
        data: { standardDeductionData: item, action: 'edit' },
        width: '450px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

  deleteStandardDeduction(item) {
    const role = item;
    const _title = 'Delete Standard Deduction';
    const _description = 'Are you sure you want to permanently delete this standard deduction?';
    const _waitDesciption = 'Standard Deduction is deleting...';
    const _deleteMessage = `Standard Deduction has been deleted`;
    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.standardDeductionService.deleteStandardDeduction(item.id).subscribe(res => {
          this.toastr.success(_deleteMessage);
          this.loadPage();
        },
          errorDelete => {
            this.toastr.error(errorDelete.error.message);
          });
      }
    });
  }
}
