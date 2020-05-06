import { Component, OnInit, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material';
import { ImagePreviewDialogComponent } from '../../../../../../views/partials/components/image-preview-dialog/image-preview-dialog.component';

@Component({
  selector: 'kt-ornaments',
  templateUrl: './ornaments.component.html',
  styleUrls: ['./ornaments.component.scss']
})
export class OrnamentsComponent implements OnInit {

  left: number = 0
  ornamentsForm: FormGroup;
  images= [];
  constructor(
    public fb: FormBuilder,
    public sharedService: SharedService,
    public toast: ToastrService,
    public ele: ElementRef,
    public dilaog: MatDialog,
  ) { }

  ngOnInit() {
    this.initForm()
  }

  initForm() {
    this.ornamentsForm = this.fb.group({
      ornamentData: this.fb.array([])
    })
    this.addmore();
  }

  get OrnamentsData() {
    if (this.ornamentsForm)
      return this.ornamentsForm.controls.ornamentData as FormArray;
  }


  addmore() {
    if (this.left < 90) {
      this.left = this.left + 15
      const left = (this.left).toString() + '%'
      const width = (document.querySelector('.addmore') as HTMLElement);
      width.style.left = left
    }
    this.OrnamentsData.push(this.fb.group({
      ornamentType: [],
      quantity: [],
      grossWeight: [, [Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      netWeight: [, [Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      deductionWeight: [, [Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      ornamentImage: [],
      weightMachineZeroWeight: [],
      withOrnamentWeight: [],
      stoneTouch: [],
      acidTest: [],
      purityTest: [],
      ltvPercent: [, [Validators.required, Validators.pattern('(?<![\\d.])(\\d{1,2}|\\d{0,2}\\.\\d{1,2})?(?![\\d.])|(100)')]],
      ltvAmount: [, [Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      currentLtvAmount: []
    }))
    console.log(this.OrnamentsData.controls)
  }

  uploadFile(index, event, string, ) {
    this.sharedService.uploadFile(event.target.files[0]).pipe(
      map(res => {
        this.patchUrlIntoForm(string, res.uploadFile.URL, index)
      }),
      catchError(err => {
        this.toast.error(err.error)
        throw err
      })).subscribe();
  }

  patchUrlIntoForm(key, url, index) {
    const controls = this.OrnamentsData.at(index) as FormGroup;
    switch (key) {
      case 'withOrnamentWeight':
        controls.controls.withOrnamentWeight.patchValue(url)
        break;
      case 'acidTest':
        controls.controls.acidTest.patchValue(url)
        break;
      case 'vm':
        controls.controls.weightMachineZeroWeight.patchValue(url)
        break;
      case 'stoneTouch':
        controls.controls.stoneTouch.patchValue(url)
        break;
      case 'purity':
        controls.controls.purityTest.patchValue(url)
        break;

      case 'ornamentImage':
        controls.controls.ornamentImage.patchValue(url)
        break;
    }
    // this.images[index].push(url)

  }

  removeImage(key, index,value) {
    const controls = this.OrnamentsData.at(index) as FormGroup;
    switch (key) {
      case 'withOrnamentWeight':
        controls.controls.withOrnamentWeight.patchValue(null)
        break;
      case 'acidTest':
        controls.controls.acidTest.patchValue(null)
        break;
      case 'vm':
        controls.controls.weightMachineZeroWeight.patchValue(null)
        break;
      case 'stoneTouch':
        controls.controls.stoneTouch.patchValue(null)
        break;
      case 'purity':
        controls.controls.purityTest.patchValue(null)
        break;
      case 'ornamentImage':
        controls.controls.ornamentImage.patchValue(null)
        break;
    }
    var idx = this.images[index].indexOf(value)
    this.images[index].splice(idx,1)
  }

  // preview(value, formIndex) {
  //   var index = this.images[formIndex].indexOf(value)
  //   this.dilaog.open(ImagePreviewDialogComponent, {
  //     data: {
  //       images: this.images[formIndex],
  //       index: index
  //     },
  //     width: "auto"
  //   })
  // }
}
