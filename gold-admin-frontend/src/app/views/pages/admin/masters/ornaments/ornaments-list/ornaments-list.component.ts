import { Component, OnInit, ViewChild } from '@angular/core';
import { OrnamentsAddComponent } from '../ornaments-add/ornaments-add.component';
import { MatPaginator, MatDialog } from '@angular/material';
import { Subject, Subscription, merge } from 'rxjs';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { map, takeUntil, distinctUntilChanged, skip, tap } from 'rxjs/operators';
import { OrnamentsService } from '../../../../../../core/masters/ornaments/services/ornaments.service';
import { OrnamentsDatasource } from '../../../../../../core/masters/ornaments/datasources/ornaments.datasource';
import { ToastrService } from 'ngx-toastr';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';

@Component({
  selector: 'kt-ornaments-list',
  templateUrl: './ornaments-list.component.html',
  styleUrls: ['./ornaments-list.component.scss']
})
export class OrnamentsListComponent implements OnInit {

  dataSource;
  displayedColumns = ['ornamentType', 'action'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private dataTableService: DataTableService,
    private ornamentsService: OrnamentsService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private layoutUtilsService: LayoutUtilsService,
  ) {
    this.ornamentsService.openModal$.pipe(
      map(res => {
        if (res) {
          this.addOrnament();
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

    this.dataSource = new OrnamentsDatasource(this.ornamentsService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.result = res;
    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.getOrnaments(1, 25, this.searchValue);
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

    this.dataSource.getOrnaments(from, to, this.searchValue);
  }

  addOrnament() {
    const dialogRef = this.dialog.open(OrnamentsAddComponent, {
      data: { action: 'add' },
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
      this.ornamentsService.openModal.next(false);
    });
  }

  editOrnament(item) {
    const dialogRef = this.dialog.open(OrnamentsAddComponent,
      {
        data: { ornamentData: item, action: 'edit' },
        width: '400px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

  deleteOrnament(_item) {
    const role = _item;
    const _title = 'Delete Ornament';
    const _description = 'Are you sure to permanently delete this Ornament?';
    const _waitDesciption = 'Ornament is deleting...';
    const _deleteMessage = `Ornament has been deleted`;
    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.ornamentsService.deleteOrnament(role.id).subscribe(successDelete => {
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
