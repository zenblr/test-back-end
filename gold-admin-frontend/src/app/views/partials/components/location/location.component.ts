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
import { DatePipe } from '@angular/common';
import { GlobalMapService } from '../../../../core/global-map/global-map.service';

@Component({
  selector: 'kt-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
  providers: [DatePipe]
})
export class LocationComponent implements OnInit {
  @Input() masterLoanId: number;
  @Input() date: Date;
  @Input() from
  dataSource: LocationDatasource;
  displayedColumns = ['appraiserName','time', 'location', 'distance', 'battery', 'coordinates', 'network', 'totalDistance'];
  leadsResult = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  destroy$ = new Subject();
  icon= {url: './assets/media/icons/ezgif.com-gif-maker.png', scaledSize: { width: 50, height: 50 }}

  // Subscriptions
  private subscriptions: Subscription[] = [];
  private unsubscribeSearch$ = new Subject();
  searchValue = '';
  queryParamsData = {
    from: 1,
    to: 25,
    search: '',
    masterLoanId: null,
    date: '',
    fromWhere:''
  }

  constructor(
    public dialog: MatDialog,
    private locationService: LocationService,
    private dataTableService: DataTableService,
    private layoutUtilsService: LayoutUtilsService,
    private toastr: ToastrService,
    private ngxPermissionService: NgxPermissionsService,
    private datePipe: DatePipe,
    private globalMapService:GlobalMapService
  ) {
  }

  ngOnInit() {
    // const permission = this.ngxPermissionService.permissions$.subscribe(res => {
    //   if (!(res.packetEdit || res.packetDelete))
    //     this.displayedColumns.splice(3, 1)
    // })
    // this.subscriptions.push(permission);
    let date = this.datePipe.transform(this.date, 'yyyy-MM-dd')

    this.queryParamsData = {
      from: 1,
      to: 25,
      search: '',
      masterLoanId: this.masterLoanId,
      date: date,
      fromWhere:this.from
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
    this.dataSource = new LocationDatasource(this.locationService,this.globalMapService);
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
    let date = this.datePipe.transform(changes.date.currentValue, 'yyyy-MM-dd')

      this.queryParamsData = {
        from: 1,
        to: 25,
        search: '',
        masterLoanId: this.masterLoanId,
        date: date,
        fromWhere:this.from
      }

      this.init()
    }

    if(changes.from && changes.from.currentValue){
      if(changes.from.currentValue == 'viewLocation'){
        let index = this.displayedColumns.indexOf('appraiserName')
        this.displayedColumns.splice(index,1)
      }
    }

  }

}

