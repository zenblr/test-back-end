import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { CustomerManagementService } from '../../../../core/customer-management';
import { tap } from 'rxjs/operators';
import { ImagePreviewDialogComponent } from '../../../../views/partials/components/image-preview-dialog/image-preview-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'kt-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.scss']
})
export class CustomerDetailsComponent implements OnInit {

  
  images: any[] = []
  customerId: number;
  cutomerDetails:any
  constructor(
    private customerService:CustomerManagementService,
    private rout: ActivatedRoute,
    private router: Router,
    private dilaog:MatDialog
    ) { }

  ngOnInit() {
    this.customerId = this.rout.snapshot.params.id
    this.customerService.getCustomerById(this.customerId).pipe(
      tap(res =>{
        this.cutomerDetails = res.data;
        this.prepareImages()
      })).subscribe()
  }

  viewLoan(loanId: number) {
    this.router.navigate(['/customer-management/customer-list/' + this.customerId + '/loan-details/' + loanId])
  }

  prepareImages(){
    Array.prototype.push.apply(this.images,this.cutomerDetails.customerKycAddress[0].addressProof)
    Array.prototype.push.apply(this.images,this.cutomerDetails.customerKycAddress[1].addressProof)
    Array.prototype.push.apply(this.images,this.cutomerDetails.customerKycBank[0].passbookProof)
    Array.prototype.push.apply(this.images,this.cutomerDetails.customerKycPersonal.identityProof)
    console.log(this.images)
  }

  preview(value) {
    let index = this.images.indexOf(value)
    this.dilaog.open(ImagePreviewDialogComponent, {
      data: {
        images: this.images,
        index: index
      },
      width: "auto"
    })
  }

}
