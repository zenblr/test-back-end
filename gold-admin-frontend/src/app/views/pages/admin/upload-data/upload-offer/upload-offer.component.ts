import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { UploadOfferService } from '../../../../../core/upload-data';
import { map, catchError, finalize } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';
import { ToastrComponent } from '../../../../partials/components';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'kt-upload-offer',
  templateUrl: './upload-offer.component.html',
  styleUrls: ['./upload-offer.component.scss']
})
export class UploadOfferComponent implements OnInit {
  images: any[] = []
  imgId: any[] = []
  index: number = null
  viewLoading: boolean = false;
  @ViewChild("file", { static: false }) file;
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;

 

  constructor(
    private uploadOfferService: UploadOfferService,
    private ref: ChangeDetectorRef,
    private ngxPermissions:NgxPermissionsService
  ) { 
    this.ngxPermissions.permissions$.subscribe(permission=>{
      if(permission.goldRateView){
        
      }
      if(permission.offerBannerView){
        this.getData();
      }
    })
  }

  ngOnInit() {
  }

  getData() {
    this.uploadOfferService.getOffers().pipe(
      map(res => {
        if (res.offerImages.length > 0) {
          res.offerImages.forEach(element => {
            this.images.push(element.offerImages.URL)
            this.imgId.push(element.offerImages.id)
          });
         
        }
        this.ref.detectChanges();
      })).subscribe()
  }

  

  

  save() {

    this.uploadOfferService.uploadOffers(this.imgId).pipe(
      (map(res => {
        this.toastr.successToastr('Uploaded Sucessfully');
        // this.uploadOfferService.goldRate.next(this.goldRate.value);
      })),
      catchError(err => {
        this.toastr.errorToastr('Please try Again');
        throw err
      }),
      finalize(() => {
      })
    ).subscribe();
  }


}
