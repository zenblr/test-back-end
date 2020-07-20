import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { LoanSettingsService } from "../../../../../core/loan-setting";
import { MatDialog } from "@angular/material"
import { AddSchemeComponent } from "../add-scheme/add-scheme.component"
import { map, takeUntil, catchError, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { PartnerService } from '../../../../../core/user-management/partner/services/partner.service';
import { SharedService } from '../../../../..//core/shared/services/shared.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-loan-scheme',
  templateUrl: './loan-scheme.component.html',
  styleUrls: ['./loan-scheme.component.scss']
})
export class LoanSchemeComponent implements OnInit {

  schemes: any[] = [];
  loader: boolean = true;
  viewLoading: boolean = false;
  destroy$ = new Subject();
  filter$ = new Subject();
  @ViewChild('matTab', { static: false }) matTab: ElementRef
  noResults: any[] = [];
  queryParamsData = {
    isActive: null
  };
  filteredDataList = {};

  constructor(
    private loanSettingService: LoanSettingsService,
    private dialog: MatDialog,
    private ref: ChangeDetectorRef,
    private rout: ActivatedRoute,
    private parnterServices: PartnerService,
    private eleref: ElementRef,
    private sharedService: SharedService,
    private toastr: ToastrService
  ) {
    this.loanSettingService.openModal$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res) {
        this.addScheme()
      }
    })

    this.loanSettingService.applyFilter$
      .pipe(takeUntil(this.filter$))
      .subscribe((res) => {
        if (Object.entries(res).length) {
          this.applyFilter(res);
        }
      });
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
          if (Object.keys(res.data).length > 0) {
            this.schemes.push(res.data)

            console.log(this.schemes)
            this.ref.detectChanges();
            this.eleref.nativeElement.querySelector('.mat-tab-labels').style.display = 'none';
            this.eleref.nativeElement.querySelector('.mat-tab-header').style.display = 'none';
          }
        }),
      catchError(err => {
        this.viewLoading = false;
        this.ref.detectChanges();
        throw (err)
      })).subscribe()
  }

  getScheme() {
    this.viewLoading = true;
    this.loanSettingService.getScheme(this.queryParamsData).pipe(
      map(res => {
        if (res.data) {
          this.schemes = res.data;
          this.ref.detectChanges();
        }
      }),
      catchError(err => {

        this.ref.detectChanges();
        throw (err)
      })).subscribe()
  }

  applyFilter(data) {
    console.log(data);
    this.queryParamsData.isActive = data.data.scheme;
    this.getScheme();
    this.filteredDataList = data.list;
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
    this.filter$.next();
    this.filter$.complete();
    this.loanSettingService.applyFilter.next({});
    this.sharedService.closeFilter.next(true);
  }

  changeDefault(event, index, item, partnerIdx) {
    // let partnerArr: [] = this.schemes[partnerIdx].schemes;
    // let count = 0;
    // partnerArr.forEach(element => {
    //   if (element['default']) {
    //     count++;
    //   }
    // });
    // if (count > 1) {
    //   this.toastr.error('Please set another scheme as default from the selected partner')
    //   return
    // }

    // let defaultStatus = event;
    this.schemes[partnerIdx].schemes[index].default = true
    // console.log(item)
    this.loanSettingService.toogleDefault(item).subscribe(res => {
      if (res) {
        this.toastr.success("Updated Successfully")
        this.getScheme()
      }
    }, err => {
      this.schemes[partnerIdx].schemes[index].default = false
      this.getScheme()
    })
    // console.log(event, index)
  }

  changeStatus(event, partnerIndex, schemeIndex, item) {
    // console.log(event, partnerIndex, schemeIndex, item);
    let partnerArr: [] = this.schemes[partnerIndex].schemes;
    // partnerArr.splice(schemeIndex, 1);
    // if (!partnerArr.length) {
    //   this.schemes.splice(partnerIndex, 1)
    // }

    // let count = 0;
    // partnerArr.forEach(element => {
    //   if (element['default']) {
    //     count++;
    //   }
    // });
    // if (count > 1) {
    //   this.toastr.error('Please set another scheme as default from the selected partner')
    //   return
    // }

    console.log(this.schemes[partnerIndex].schemes[schemeIndex].isActive)

    let params = { isActive: event }
    this.loanSettingService.changeSchemeStatus(item.id, params)
      .pipe(map(() => {
        if (event) {
          this.toastr.success('Scheme Activated');
          this.schemes[partnerIndex].schemes[schemeIndex].isActive = event
        } else {
          this.toastr.success('Scheme Deactivated');
          this.schemes[partnerIndex].schemes[schemeIndex].isActive = !event
        }
        // this.getScheme()
      }),
        catchError(err => {
          if (err) {
            // if (!event) {
            //   this.schemes[partnerIndex].schemes[schemeIndex].isActive = false
            // } else {
            //   this.schemes[partnerIndex].schemes[schemeIndex].isActive = true
            // }
            // setTimeout(() => {
            //   this.schemes[partnerIndex].schemes[schemeIndex].isActive = false
            // }, 500)
          }
          throw (err)
        }),
        finalize(() => {
          this.getScheme()
          this.ref.detectChanges()
        })
      ).subscribe()
  }

}
