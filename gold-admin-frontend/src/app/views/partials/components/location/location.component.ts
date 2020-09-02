import { Component, OnInit, ViewChild, Input, SimpleChanges } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subscription, merge, Subject, from } from 'rxjs';
import { tap, distinctUntilChanged, skip, takeUntil, map } from 'rxjs/operators';
import { DataTableService } from '../../../../core/shared/services/data-table.service';
import { PacketsDatasource, PacketsService } from '../../../../core/loan-management'
import { LayoutUtilsService } from '../../../../core/_base/crud';
import { ToastrService } from 'ngx-toastr';
import { NgxPermissionsService } from 'ngx-permissions';
import { LocationDatasource } from '../../../../core/loan-management/view-location/location/datasources/location.datasource';
import { LocationService } from '../../../../core/loan-management/view-location/location/services/location.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'kt-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit {
  @Input() masterLoanId: number;
  @Input() date: Date;
@Input() from ;
  dataSource: LocationDatasource;
  displayedColumns = ['time', 'location', 'distance', 'battery', 'coordinates', 'network', 'totalDistance'];
  leadsResult = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  destroy$ = new Subject();

  // Subscriptions
  private subscriptions: Subscription[] = [];
  private unsubscribeSearch$ = new Subject();
  searchValue = '';
  queryParamsData = {
    from: 1,
    to: 25,
    search: '',
    masterLoanId: null,
    date: ''
  }

  constructor(
    public dialog: MatDialog,
    private locationService: LocationService,
    private dataTableService: DataTableService,
    private layoutUtilsService: LayoutUtilsService,
    private toastr: ToastrService,
    private ngxPermissionService: NgxPermissionsService,
  ) {
  }

  ngOnInit() {
    // const permission = this.ngxPermissionService.permissions$.subscribe(res => {
    //   if (!(res.packetEdit || res.packetDelete))
    //     this.displayedColumns.splice(3, 1)
    // })
    // this.subscriptions.push(permission);


    this.queryParamsData = {
      from: 1,
      to: 25,
      search: '',
      masterLoanId: this.masterLoanId,
      date: (this.date).toISOString()
    }

    // this.init()

  }

  init() {
    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => {
        this.loadPackets();
      })
    )
      .subscribe();
    this.subscriptions.push(paginatorSubscriptions);

    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.queryParamsData.search = res;
        this.paginator.pageIndex = 0;
        this.loadPackets();
      });

    // Init DataSource
    this.dataSource = new LocationDatasource(this.locationService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.leadsResult = res;
    });
    this.subscriptions.push(entitiesSubscription);
    this.dataSource.loadpacketsLocation(this.queryParamsData);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  loadPackets() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    this.queryParamsData.from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    this.queryParamsData.to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadpacketsLocation(this.queryParamsData);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes)
    if (changes && changes.date.currentValue) {
      this.queryParamsData = {
        from: 1,
        to: 25,
        search: '',
        masterLoanId: this.masterLoanId,
        date: (changes.date.currentValue).toISOString()
      }

      this.init()
    }

  }

}

