import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LayoutUtilsService, } from '../../../../../core/_base/crud';
import { MatSnackBar, MatDialog, MatPaginator, MatSort } from '@angular/material';
import { ConcurrentUserDatasource,ConcurrentUserLoginService } from '../../../../../core/user-management/concurrent-user-login';
import { Subscription, merge, Subject } from 'rxjs';
import { tap, distinctUntilChanged, skip, takeUntil } from 'rxjs/operators';
import { ToastrComponent } from '../../../../partials/components/toastr/toastr.component';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { Router } from '@angular/router';

@Component({
  selector: 'kt-concurrent-user-login',
  templateUrl: './concurrent-user-login.component.html',
  styleUrls: ['./concurrent-user-login.component.scss']
})
export class ConcurrentUserLoginComponent implements OnInit {

  
  // Table fields
  dataSource: ConcurrentUserDatasource;
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  displayedColumns = ['appraiserName', 'actions'];
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
    private concurrentUserLoginService: ConcurrentUserLoginService,
    public dataTableService: DataTableService,
    private router: Router,
  ) {
    // if (this.router.url == '/user-management/redirect-assign-appraiser') {
    //   this.addAppraiser();
    // }

    // this.concurrentUserLoginService.openModal$.pipe(takeUntil(this.destroy$)).subscribe(res => {
    //   if (res) {
    //     this.addAppraiser();
    //   }
    // })
  }

  ngOnInit() {

    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadPage();
      });

    // Init DataSource
    this.dataSource = new ConcurrentUserDatasource(this.concurrentUserLoginService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.appraiserResult = res;
    });
    this.subscriptions.push(entitiesSubscription);

    // First load
    // this.loadPage();

    this.dataSource.loadUser(this.searchValue, 1, 25);
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

    this.dataSource.loadUser(this.searchValue, from, to);
  }

  remove(data){
    const _title = 'Authentication Key';
    const _description = 'Are you sure to permanently remove this key?';
    const _waitDesciption = 'Key is deleting...';
    const _deleteMessage = `Key has been deleted`;

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }
    this.concurrentUserLoginService.remove(data.id).subscribe(result=>{
      this.loadPage();
      this.toastr.successToastr(result.message)
    })
  })
}



 



}

