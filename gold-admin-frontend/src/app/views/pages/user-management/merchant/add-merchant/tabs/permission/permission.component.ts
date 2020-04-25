import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { ToastrComponent } from '../../../../../../../views/partials/components/toastr/toastr.component';
import { map } from 'rxjs/operators';
import { MerchantService } from '../../../../../../../core/user-management/merchant';


@Component({
  selector: 'kt-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.scss']
})
export class PermissionComponent implements OnInit {

  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  permission: [] = []

  constructor(
    private merchantService: MerchantService
  ) {
  }

  ngOnInit() {
    this.getData()
  }
  getData() {
    this.merchantService.getPermission().pipe(
      map(res => {
        console.log(res)
        this.permission = res;        
      })
    ).subscribe()
  }

}

