import { Component, OnInit } from '@angular/core';
import { LoanApplicationFormService } from '../../../../../core/loan-management';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { ImagePreviewDialogComponent } from '../../../../partials/components/image-preview-dialog/image-preview-dialog.component';

@Component({
  selector: 'kt-loan-details',
  templateUrl: './loan-details.component.html',
  styleUrls: ['./loan-details.component.scss']
})
export class LoanDetailsComponent implements OnInit {

  images: any = []
  loanId
  loanDetails: any
  constructor(
    private loanservice: LoanApplicationFormService,
    private rout: ActivatedRoute,
    public dilaog: MatDialog,
  ) { }

  ngOnInit() {
    this.loanId = this.rout.snapshot.params.loanId
    this.loanservice.getLoanDataById(this.loanId).subscribe(res => {
      this.loanDetails = res.data
      this.createOrnamentsImage()
      // console.log(this.images)
    })
  }

  createOrnamentsImage() {
    for (let ornametsIndex = 0; ornametsIndex < this.loanDetails.loanOrnamentsDetail.length; ornametsIndex++) {
      let ornamets = this.loanDetails.loanOrnamentsDetail[ornametsIndex]
      this.createImageArray()
      let keys = Object.keys(ornamets)
      for (let index = 0; index < keys.length; index++) {
        let url = ornamets[keys[index]]
        this.patchUrlIntoForm(keys[index], url, ornametsIndex)
      }
    }

  }

  createImageArray() {
    let data = {
      withOrnamentWeight: '',
      acidTest: '',
      weightMachineZeroWeight: '',
      stoneTouch: '',
      purity: '',
      ornamentImage: ''
    }
    this.images.push(data)
  }

  patchUrlIntoForm(key, url, index) {
    switch (key) {
      case 'withOrnamentWeight':
        this.images[index].withOrnamentWeight = url
        break;
      case 'acidTest':
        this.images[index].acidTest = url

        break;
      case 'weightMachineZeroWeight':
        this.images[index].weightMachineZeroWeight = url

        break;
      case 'stoneTouch':
        this.images[index].stoneTouch = url

        break;
      case 'purityTest':
        let temp = []
        // if (controls.controls.purityTest.value.length > 0)
        //   temp = controls.controls.purityTest.value
        temp.push(url)
        if (typeof url == "object") {
          this.images[index].purity = url[0]
        } else {
          this.images[index].purity = url
        }


        break;

      case 'ornamentImage':
        this.images[index].ornamentImage = url

        break;
    }


  }

  preview(value, formIndex) {
    let filterImage = []
    filterImage = Object.values(this.images[formIndex])
    var temp =[]
    temp = filterImage.filter(el=>{
      return el != ''
    })
    let index = temp.indexOf(value)
    this.dilaog.open(ImagePreviewDialogComponent, {
      data: {
        images: temp,
        index: index
      },
      width: "auto"
    })
  }

}
