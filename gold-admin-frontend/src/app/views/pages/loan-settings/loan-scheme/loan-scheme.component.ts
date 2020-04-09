import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LoanSettingsService } from "../../../../core/loan-setting";
import { MatDialog } from "@angular/material"
import { AddSchemeComponent } from "../add-scheme/add-scheme.component"
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'kt-loan-scheme',
  templateUrl: './loan-scheme.component.html',
  styleUrls: ['./loan-scheme.component.scss']
})
export class LoanSchemeComponent implements OnInit {

  schemes: String[] = []
  loader: boolean = true
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
    this.loanSettingService.getScheme().pipe(
      map(res => {
        this.schemes = res.data;
        this.ref.detectChanges();
      })).subscribe()
  }

  addScheme() {
    const dialogRef = this.dialog.open(AddSchemeComponent, {
      width: '650px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        // this.loadLeadsPage();
      }
      this.loanSettingService.openModal.next(false);
    });
  }
  ngDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

}
