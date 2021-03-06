import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { LoanSettingsService } from "../../../../../core/loan-setting";
import { MatDialog } from "@angular/material"
import { AddSchemeComponent } from "../add-scheme/add-scheme.component"
import { map, takeUntil, catchError, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { PartnerService } from '../../../../../core/user-management/partner/services/partner.service';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { RpgEditComponent } from '../../../../partials/components/rpg-edit/rpg-edit.component';

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
    private toastr: ToastrService,
    private layoutUtilsService: LayoutUtilsService
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
  openRpgModal(scheme, action) {

    const dialogRef = this.dialog.open(RpgEditComponent, {
      data: {
        scheme: scheme,
        action: action
      },
      width: '450px'
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

  // changeDefault(event, index, item, partnerIdx) {
  //   this.schemes[partnerIdx].schemes[index].default = true
  //   this.loanSettingService.toogleDefault(item).subscribe(res => {
  //     if (res) {
  //       this.toastr.success("Updated Successfully")
  //       this.getScheme()
  //     }
  //   }, err => {
  //     this.schemes[partnerIdx].schemes[index].default = false
  //     this.getScheme()
  //   })
  // }

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
      }),
        catchError(err => {
          if (err) {
          }
          throw (err)
        }),
        finalize(() => {
          this.getScheme()
          this.ref.detectChanges()
        })
      ).subscribe()
  }

  scrollToUnsecuredScheme(id) {
    setTimeout(() => {
      let view = this.eleref.nativeElement.querySelector(`#${id}`) as HTMLElement
      view.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 250)
  }

  confirmation(event, partnerIndex, schemeIndex, item) {
    const _title = 'Deactivate Scheme';
    const _description = 'Are you sure you want to deactivate  this Scheme?';
    const _waitDesciption = ' Scheme is deactivating.';
    const _deleteMessage = ` Logistic Partner has been deleted`;

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.changeStatus(event, partnerIndex, schemeIndex, item)
      }
    });
  }

}
