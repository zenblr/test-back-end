import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LoanSettingsService } from "../../../../core/loan-setting";
import { MatDialog } from "@angular/material"
import { AddSchemeComponent } from "../add-scheme/add-scheme.component"
import { map, takeUntil, catchError } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'kt-loan-scheme',
  templateUrl: './loan-scheme.component.html',
  styleUrls: ['./loan-scheme.component.scss']
})
export class LoanSchemeComponent implements OnInit {

  schemes: String[] = []
  loader: boolean = true;
  viewLoading: boolean = false;
  destroy$ = new Subject()

  constructor(private loanSettingService: LoanSettingsService,
    private dialog: MatDialog,
    private ref: ChangeDetectorRef) {
    this.loanSettingService.openModal$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res) {
        this.addScheme()
      }
    })
  }

  ngOnInit() {

    this.getScheme()
  }

  getScheme() {
    this.viewLoading = true;
    this.loanSettingService.getScheme().pipe(
      map(res => {
        this.schemes = res.data;
        this.viewLoading = false;
        this.ref.detectChanges();
      }),
      catchError(err => {
        this.viewLoading = false;
        this.ref.detectChanges();
        throw (err)
      })).subscribe()
  }

  addScheme() {
    const dialogRef = this.dialog.open(AddSchemeComponent, {
      width: '650px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.getScheme()
      }
      this.loanSettingService.openModal.next(false);
    });
  }
  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

}
