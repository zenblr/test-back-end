import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LayoutUtilsService, } from '../../../../../core/_base/crud';
import { MatSnackBar, MatDialog, MatPaginator, MatSort } from '@angular/material';
import { AppraiserDatasource,AppraiserService } from '../../../../../core/user-management/appraiser';
import { Subscription, merge, Subject } from 'rxjs';
import { tap, distinctUntilChanged, skip, takeUntil } from 'rxjs/operators';
import { AddAppraiserComponent } from '../add-appraiser/add-appraiser.component';
import { ToastrComponent } from '../../../../../views/partials/components/toastr/toastr.component';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';

@Component({
  selector: 'kt-appraiser-list',
  templateUrl: './appraiser-list.component.html',
  styleUrls: ['./appraiser-list.component.scss']
})
export class AppraiserListComponent implements OnInit {

 
  // Table fields
  dataSource: AppraiserDatasource;
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  displayedColumns = ['customerId', 'customerName','actions'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
 
  // Filter fields
  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  appraiserResult: any[] = [];


  // Subscriptions
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject();
  private unsubscribeSearch$ = new Subject();
  searchValue = '';


  constructor(
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private layoutUtilsService: LayoutUtilsService,
    private appraiserService: AppraiserService,
    private dataTableService: DataTableService
  ) {
    this.appraiserService.openModal$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res) {
        this.addAppraiser();
      }
    })
  }

  ngOnInit() {
   
    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadBranchPage();
      });

    // Init DataSource
    this.dataSource = new AppraiserDatasource(this.appraiserService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.appraiserResult = res;
    });
    this.subscriptions.push(entitiesSubscription);

    // First load
    // this.loadBranchPage();

    this.dataSource.loadBranches(1, 25, this.searchValue,);
  }

	/**
	 * On Destroy
	 */
  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
  }


  loadBranchPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadBranches(from, to, this.searchValue);
  }

	/**
	 * Returns object for filter
	 */
  filterConfiguration(): any {
    const filter: any = {};
    const searchText: string = this.searchInput.nativeElement.value;
    filter.title = searchText;
    return filter;
  }

  /** ACTIONS */
	/**
	 * Delete role
	 *
	 * @param _item: Role
	 */
  // deleteRole(_item) {
  //   const role = _item;
  //   const _title = 'Delete Branch';
  //   const _description = 'Are you sure to permanently delete this branch?';
  //   const _waitDesciption = 'Branch is deleting...';
  //   const _deleteMessage = `Branch has been deleted`;

  //   const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
  //   dialogRef.afterClosed().subscribe(res => {
  //     if (res) {
  //       console.log(res);
  //       this.appraiserService.deleteBranch(role.id).subscribe(successDelete => {
  //         this.toastr.successToastr(_deleteMessage);
  //         this.loadBranchPage();
  //       },
  //         errorDelete => {
  //           this.toastr.errorToastr(errorDelete.error.message);
  //         });
  //     }
  //   });
  // }

  addAppraiser() {
    const dialogRef = this.dialog.open(AddAppraiserComponent, {
      data: { action: 'add' },
      width: '450px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadBranchPage();
      }
    });
    this.appraiserService.openModal.next(false)
  }

	/**
	 * Edit role
	 *
	 * @param role: Role
	 */
  editRole(role) {
    console.log(role);
    // const _saveMessage = `Role successfully has been saved.`;
    // const _messageType = role.id ? MessageType.Update : MessageType.Create;
    const dialogRef = this.dialog.open(AddAppraiserComponent,
      {
        data: { partnerId: role.id, action: 'edit' },
        width: '450px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadBranchPage();
      }
    });
  }

  viewRole(role) {
    const dialogRef = this.dialog.open(AddAppraiserComponent, {
      data: { partnerId: role.id, action: 'view' },
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }
    });
  }




}
