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
  pdf = { loanAgreementCopyImage: false, pawnCopyImage: false, schemeConfirmationCopyImage: false }
  constructor(
    private loanservice: LoanApplicationFormService,
    private rout: ActivatedRoute,
    public dilaog: MatDialog,
  ) { }

  ngOnInit() {
    this.loanId = this.rout.snapshot.params.loanId
    let masterLoanId = this.rout.snapshot.params.loanId
    this.loanservice.getLoanDetails(this.loanId,masterLoanId).subscribe(res => {
      this.loanDetails = res.data
      this.createOrnamentsImage()
      this.pdfCheck()
      console.log(this.images)
    })
  }

  pdfCheck(){
    let laonAgree = this.loanDetails.customerLoanDocument.loanAgreementCopyImage[0].split('.')
    let pawn = this.loanDetails.customerLoanDocument.pawnCopyImage[0].split('.')
    let scheme = this.loanDetails.customerLoanDocument.schemeConfirmationCopyImage[0].split('.')
    if(laonAgree[laonAgree.length - 1] == 'pdf'){
      this.pdf.loanAgreementCopyImage = true
    }else{
      this.pdf.loanAgreementCopyImage = false

    }
    if(pawn[pawn.length - 1] == 'pdf'){
      this.pdf.pawnCopyImage = true

    }else{
      this.pdf.pawnCopyImage = false
      
    }
    if(scheme[scheme.length - 1] == 'pdf'){
      this.pdf.schemeConfirmationCopyImage = true

    }else{
      this.pdf.schemeConfirmationCopyImage = false
      
    }
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
      case 'withOrnamentWeightData':
        this.images[index].withOrnamentWeight = url.URL
        break;
      case 'acidTestData':
        this.images[index].acidTest = url.URL

        break;
      case 'weightMachineZeroWeightData':
        this.images[index].weightMachineZeroWeight = url.URL

        break;
      case 'stoneTouchData':
        this.images[index].stoneTouch = url.URL

        break;
      case 'purityTestImage':
        this.images[index].purity = url.URL

        break;

      case 'ornamentImageData':
        this.images[index].ornamentImage = url.URL

        break;
    }


  }

  preview(value, formIndex) {
    let filterImage = []
    filterImage = Object.values(this.images[formIndex])
    var temp = []
    temp = filterImage.filter(el => {
      return el != ''
    })
    let array = []
    for (let index = 0; index < temp.length; index++) {
      if (typeof temp[index] == "object") {
        array = temp[index]
        temp.splice(index, 1)
      }
    }
    console.log(temp)

    let finalArray = [...array, ...temp]
    console.log(finalArray)
    let index = finalArray.indexOf(value)
    this.dilaog.open(ImagePreviewDialogComponent, {
      data: {
        images: finalArray,
        index: index
      },
      width: "auto"
    })
  }

}
