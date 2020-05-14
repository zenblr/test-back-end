import { Component, OnInit, ElementRef, Input, ChangeDetectorRef, AfterViewInit, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material';
import { ImagePreviewDialogComponent } from '../../../../../../views/partials/components/image-preview-dialog/image-preview-dialog.component';
import { UploadOfferService } from '../../../../../../core/upload-data';
import { KaratDetailsService } from '../../../../../../core/loan-setting/karat-details/services/karat-details.service';


@Component({
  selector: 'kt-ornaments',
  templateUrl: './ornaments.component.html',
  styleUrls: ['./ornaments.component.scss']
})
export class OrnamentsComponent implements OnInit, AfterViewInit, OnChanges {

  selected: number = 0
  goldRate: any;
  @Input() invalid;
  @Input() disable
  @Output() OrnamentsDataEmit: EventEmitter<any> = new EventEmitter()
  left: number = 150
  width: number = 0
  ornamentsForm: FormGroup;
  images: any = [];
  karatArr = [{ value: 18, name: '18 K' },
  { value: 19, name: '19 K' },
  { value: 20, name: '20 K' },
  { value: 21, name: '21 K' },
  { value: 22, name: '22 K' }]
  purityBasedDeduction: number;
  ltvPercent = [];

  constructor(
    public fb: FormBuilder,
    public sharedService: SharedService,
    public toast: ToastrService,
    public ele: ElementRef,
    public dilaog: MatDialog,
    public ref: ChangeDetectorRef,
    public uploadOfferService: UploadOfferService,
    public karatService: KaratDetailsService
  ) {

  }

  ngOnInit() {
    this.getKarat()
    this.initForm()
    this.ornamentsForm.valueChanges.subscribe(() => {
      this.OrnamentsDataEmit.emit(this.OrnamentsData)
      console.log('jkhjs')
    })
  }

  getKarat() {
    this.karatService.getAllKaratDetails().pipe(
      map(res => {
        this.karatArr = res
      })
    )
  }

  initForm() {
    this.ornamentsForm = this.fb.group({
      ornamentData: this.fb.array([])
    })
    this.addmore();
    this.OrnamentsDataEmit.emit(this.OrnamentsData)

  }

  ngOnChanges() {
    if (this.disable) {
      this.ornamentsForm.disable()
    }
    if (this.invalid) {
      let array = this.OrnamentsData.controls
      for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (element.invalid) {
          element.markAllAsTouched();
          this.selected = index
          return
        }
      }
      this.ornamentsForm.markAllAsTouched()
    }
  }

  ngAfterViewInit() {
    this.uploadOfferService.goldRate$.subscribe(res => {
      this.goldRate = res
      const group = this.OrnamentsData.at(0) as FormGroup
      group.controls.currentLtvAmount.patchValue(this.goldRate)
    })
  }
  get OrnamentsData() {
    if (this.ornamentsForm)
      return this.ornamentsForm.controls.ornamentData as FormArray;
  }

  calcGoldDeductionWeight(index) {
    const group = this.OrnamentsData.at(index) as FormGroup;
    if(group.controls.grossWeight.valid && group.controls.netWeight.valid){
    const deductionWeight = group.controls.grossWeight.value - group.controls.netWeight.value;
    group.controls.deductionWeight.patchValue(deductionWeight);
    console.log(deductionWeight)
    this.currentNetWeight(index)
    }
  }

  currentNetWeight(index){
    const group = this.OrnamentsData.at(index) as FormGroup;
    if(group.controls.purity.valid && group.controls.netWeight.valid){
      const netWeight = group.controls.netWeight.value - (group.controls.purity.value/100)
      group.controls.currentNetWeight.patchValue(netWeight)
      this.calculateLtvAmount(index)
    }
  }

  addmore() {
    if (this.left < 900) {
      this.width = this.width + 130
      if (this.width > 130)
        this.left = this.left + 130
      const left = (this.left).toString() + 'px'
      const width = (this.ele.nativeElement.querySelector('.mat-tab-header') as HTMLElement);
      const addmore = (this.ele.nativeElement.querySelector('.addmore') as HTMLElement);
      width.style.maxWidth = left
      addmore.style.left = left

    }
    this.OrnamentsData.push(this.fb.group({
      ornamentType: [, Validators.required],
      quantity: [, Validators.required],
      grossWeight: [, [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      netWeight: [, [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      deductionWeight: [, [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      ornamentImage: [, Validators.required],
      weightMachineZeroWeight: [, Validators.required],
      withOrnamentWeight: [, Validators.required],
      stoneTouch: [, Validators.required],
      acidTest: [, Validators.required],
      karat: [, Validators.required],
      purity: [, [Validators.required]],
      ltvRange: [[]],
      currentNetWeight:[],
      purityTest: [[], Validators.required],
      ltvPercent: [, [Validators.required]],
      ltvAmount: [],
      loanAmount:[],
      currentLtvAmount: [this.goldRate]
    }))
    console.log(this.OrnamentsData.controls)
  }

  selectKarat(index) {
    const controls = this.OrnamentsData.at(index) as FormGroup;;
    console.log(controls.controls.ltvPercent.patchValue(''));
    controls.controls.ltvAmount.patchValue(null)
    switch (controls.controls.karat.value) {
      case '18':
        this.ltvPercent = ['75', '76', '77', '78', '79'];
        controls.controls.ltvRange.patchValue(this.ltvPercent)
        this.purityBasedDeduction = 7.5;
        controls.controls.purity.patchValue(this.purityBasedDeduction);
        break;
      case '19':
        this.ltvPercent = ['80', '81', '82', '83', '84'];
        controls.controls.ltvRange.patchValue(this.ltvPercent)
        this.purityBasedDeduction = 5;
        controls.controls.purity.patchValue(this.purityBasedDeduction);
        break;
      case '20':
        this.ltvPercent = ['85', '86', '87', '88', '89'];
        controls.controls.ltvRange.patchValue(this.ltvPercent)
        this.purityBasedDeduction = 2;
        controls.controls.purity.patchValue(this.purityBasedDeduction);
        break;
      case '21':
        this.ltvPercent = ['90', '91', '92', '93', '94'];
        controls.controls.ltvRange.patchValue(this.ltvPercent)
        this.purityBasedDeduction = 1.5;
        controls.controls.purity.patchValue(this.purityBasedDeduction);
        break;
      case '22':
        this.ltvPercent = ['95', '96', '97', '98', '99', '100'];
        controls.controls.ltvRange.patchValue(this.ltvPercent)
        this.purityBasedDeduction = 1;
        controls.controls.purity.patchValue(this.purityBasedDeduction);
        break;
      default:
        break;
    }
    this.ref.detectChanges()
    this.currentNetWeight(index)
    console.log(this.ltvPercent)
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
        let temp = []
        if (controls.controls.purityTest.value.length > 0)
          temp = controls.controls.purityTest.value
        temp.push(url)
        controls.controls.purityTest.patchValue(temp)
        break;

      case 'ornamentImage':
        controls.controls.ornamentImage.patchValue(url)
        break;
    }
    let data = { index: index, url: url }
    this.images.push(data)

  }

  removeImage(key, index, value) {
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
    this.images[index].splice(idx, 1)
  }

  preview(value, formIndex) {
    let filterImage = []
    this.images.forEach(img => {
      if (img.index === formIndex)
        filterImage.push(img.url)
    })
    let img = Object.values(filterImage)
    let index = img.indexOf(value)
    this.dilaog.open(ImagePreviewDialogComponent, {
      data: {
        images: img,
        index: index
      },
      width: "auto"
    })
  }

  calculateLtvAmount(index: number) {
    const controls = this.OrnamentsData.at(index) as FormGroup;
    if(controls.controls.currentNetWeight.valid && controls.controls.purity.valid
      && controls.controls.ltvPercent.valid ){
    let ltvPercent = controls.controls.ltvPercent.value
    let ltv = controls.controls.currentLtvAmount.value * (ltvPercent / 100)
    controls.controls.ltvAmount.patchValue(ltv)
    controls.controls.loanAmount.patchValue(ltv*controls.controls.currentNetWeight.value)
    console.log(ltv*controls.controls.netWeight.value)
    }
  }
}
