import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { LoanSettingsService } from "../../../../core/loan-setting";
import { MatDialog } from "@angular/material"
import { AddSchemeComponent } from "../add-scheme/add-scheme.component"
import { map, takeUntil, catchError } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { PartnerService } from '../../../../core/user-management/partner/services/partner.service';

@Component({
  selector: 'kt-loan-scheme',
  templateUrl: './loan-scheme.component.html',
  styleUrls: ['./loan-scheme.component.scss']
})
export class LoanSchemeComponent implements OnInit {

  schemes: any[] = []
  loader: boolean = true;
  viewLoading: boolean = false;
  destroy$ = new Subject();
  @ViewChild('matTab', { static: false }) matTab: ElementRef
  noResults: any[]=[];

  constructor(
    private loanSettingService: LoanSettingsService,
    private dialog: MatDialog,
    private ref: ChangeDetectorRef,
    private rout: ActivatedRoute,
    private parnterServices: PartnerService,
    private eleref: ElementRef
  ) {
    this.loanSettingService.openModal$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res) {
        this.addScheme()
      }
    })
  }

  ngOnInit() {
    var id = this.rout.snapshot.params.id;
    if (id) {
      this.getSchemesByPartners(id);
    } else {
      this.getScheme()
    }

  }

  getSchemesByPartners(id) {
    this.parnterServices.getSchemesByParnter(id).pipe(
      map(
        res => {
          this.schemes.push(res.data)
          this.noResults = res.data.schemes;
          console.log(this.noResults.length)
          this.ref.detectChanges();
          this.eleref.nativeElement.querySelector('.mat-tab-labels').style.display = 'none';
          this.eleref.nativeElement.querySelector('.mat-tab-header').style.display = 'none';
        }),
      catchError(err => {
        this.viewLoading = false;
        this.ref.detectChanges();
        throw (err)
      })).subscribe()
  }

  getScheme() {
    this.viewLoading = true;
    this.loanSettingService.getScheme().pipe(
      map(res => {
        this.schemes = res.data;
        this.noResults = res.data;
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
      width: '600px'
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
