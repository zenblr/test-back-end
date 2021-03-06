import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LayoutUtilsService, } from '../../../../../../core/_base/crud';
import { MatSnackBar, MatDialog, MatPaginator, MatSort } from '@angular/material';
import { AppraiserDatasource, AppraiserService } from '../../../../../../core/user-management/appraiser';
import { Subscription, merge, Subject } from 'rxjs';
import { tap, distinctUntilChanged, skip, takeUntil } from 'rxjs/operators';
import { AssignAppraiserComponent } from '../assign-appraiser/assign-appraiser.component';
import { ToastrComponent } from '../../../../../partials/components/toastr/toastr.component';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { Router } from '@angular/router';

@Component({
  selector: 'kt-appraiser-list',
  templateUrl: './appraiser-list.component.html',
  styleUrls: ['./appraiser-list.component.scss']
})
export class AppraiserListComponent implements OnInit {


  // Table fields
  dataSource: AppraiserDatasource;
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  displayedColumns = ['customerId', 'customerName', 'actions'];
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
    public dataTableService: DataTableService,
    private router: Router,
  ) {
    // if (this.router.url == '/user-management/redirect-assign-appraiser') {
    //   this.addAppraiser();
    // }

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
        this.loadPage();
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
    // this.loadPage();

    this.dataSource.loadBranches(this.searchValue, 1, 25);
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


  loadPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadBranches(this.searchValue, from, to);
  }



  addAppraiser() {
    const dialogRef = this.dialog.open(AssignAppraiserComponent, {
      data: { action: 'add',from:'appraiser' },
      width: '450px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
    this.appraiserService.openModal.next(false)
  }

	/**
	 * Edit appraiser
	 *
	 * @param appraiser: appraiser
	 */
  editappraiser(appraiser, action) {
    
    // const _saveMessage = `appraiser successfully has been saved.`;
    // const _messageType = appraiser.id ? MessageType.Update : MessageType.Create;
    const dialogRef = this.dialog.open(AssignAppraiserComponent,
      {
        data: { appraiser: appraiser, customer: appraiser.customer, action: action },
        width: '450px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

}
