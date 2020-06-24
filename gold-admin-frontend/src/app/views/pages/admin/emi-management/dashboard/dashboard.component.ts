// Angular
import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../../../core/emi-management/dashboard/dashboard.service'
import { Observable } from 'rxjs';

@Component({
  selector: 'kt-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  dashboardDetails$: Observable<any>;

  constructor(
    private dashboardService: DashboardService
  ) { }

  ngOnInit() {
    this.getBrokerDashboard();
  }

  getBrokerDashboard() {
    this.dashboardDetails$ = this.dashboardService.getBrokerDashboard();
  }
}
