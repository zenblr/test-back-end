import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription, merge } from 'rxjs';
import { KaratDetailsDataSource } from '../../../../../../core/loan-setting/karat-details/datasource/karat-details.datasource'
import { MatPaginator, MatDialog, MatSort } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { map } from 'lodash';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { Role } from '../../../../../../core/auth';
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
import { KaratDetailsService } from '../../../../../../core/loan-setting/karat-details/services/karat-details.service';
import { takeUntil, tap, skip, distinctUntilChanged } from 'rxjs/operators';
import { AddKaratDetailsComponent } from '../add-karat-details/add-karat-details.component';
import { NgxPermissionsService } from 'ngx-permissions';
@Component({
  selector: 'kt-list-karat-details',
  templateUrl: './list-karat-details.component.html',
  styleUrls: ['./list-karat-details.component.scss']
})
export class ListKaratDetailsComponent implements OnInit {

  destroy$ = new Subject();
  private subscriptions: Subscription[] = [];
  public logisticPartner: any = [];
  dataSource: KaratDetailsDataSource;
  private unsubscribeSearch$ = new Subject();
  searchValue = '';
  /**
   * @param layoutUtilsService:LayoutUtilsService
   */
  displayedColumns = ['karat', 'fromPercentage', 'toPercentage', 'actions'];
  // @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  partnerService: any;

  constructor(
    public dialog: MatDialog,
    private karatDetailsServices: KaratDetailsService,
    private dataTableService: DataTableService,
    private layoutUtilsService: LayoutUtilsService,
    private toast: ToastrService,
    private ngxPermissionService: NgxPermissionsService
  ) {

    this.karatDetailsServices.openModal$.pipe(
      takeUntil(this.destroy$)).subscribe((res => {
        if (res) {
          this.addRole()
        }
      }));

  }


  ngOnInit() {
    this.ngxPermissionService.permissions$.subscribe(res => {
      if (!(res.karatDetailsEdit || res.karatDetailsDelete))
        this.displayedColumns.splice(3, 1)
    })

    // const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    // this.subscriptions.push(sortSubscription);

    // const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
    //   tap(() => {
    // //     this.loadBranchPage();
    //   })
    // )
    //   .subscribe();
    // this.subscriptions.push(paginatorSubscriptions);

    // const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
    // .subscribe(res => {
    //   this.searchValue = res;
    //   this.paginator.pageIndex = 0;
    //   this.loadBranchPage();
    // });

    // this.dataSource.paginator = this.paginator;
    this.dataSource = new KaratDetailsDataSource(this.karatDetailsServices);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.logisticPartner = res;
    });
    this.subscriptions.push(entitiesSubscription);
    this.dataSource.loadKaratDetails();

  }
  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
  }


  loadBranchPage() {
    // if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
    //   return;
    // let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    // let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadKaratDetails();
  }
  /** ACTIONS */
	/**
	 * Delete role
	 *
	 * @param _item: Role
	 */
  deleteRole(_item: Role) {
    const role = _item;
    const _title = 'Delete  karat Details';
    const _description = 'Are you sure to permanently delete this karat details?';
    const _waitDesciption = ' Karat Details is deleting.';
    const _deleteMessage = ` karat details has been deleted`;

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        console.log(res);
        this.karatDetailsServices.deleteKaratDetails(role.id).subscribe(successDelete => {
          this.toast.success(_deleteMessage);
          this.loadBranchPage();
        },
          errorDelete => {
            // this.toastr.errorToastr(errorDelete.error.message);
          });
      }
    });
  }



  addRole(): void {
    const dialogRef = this.dialog.open(AddKaratDetailsComponent, {
      data: { action: 'add' }, width: '450px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadBranchPage();
      }
    })
    this.karatDetailsServices.openModal.next(false);
  }
  /**
	 * Edit role
	 *
	 * @param role: Role
	 */
  editRole(role: Role) {
    const _saveMessage = `Role successfully has been saved.`;
    const _messageType = role.id ? MessageType.Update : MessageType.Create;
    const dialogRef = this.dialog.open(AddKaratDetailsComponent, {
      data: { karatDetailsId: role.id, action: 'edit' },
      width: '450px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadBranchPage();
      }
    });

  }
}
