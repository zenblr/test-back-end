import { Component, OnInit, ElementRef, Input, ChangeDetectorRef, AfterViewInit, Output, EventEmitter, OnChanges, SimpleChanges, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { map, catchError, filter } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material';
import { ImagePreviewDialogComponent } from '../../../../../../views/partials/components/image-preview-dialog/image-preview-dialog.component';
import { UploadOfferService } from '../../../../../../core/upload-data';
import { KaratDetailsService } from '../../../../../../core/loan-setting/karat-details/services/karat-details.service';
import { Router } from '@angular/router';
import { LoanApplicationFormService } from '../../../../../../core/loan-management';
import { GoldRateService } from '../../../../../../core/upload-data/gold-rate/gold-rate.service';
import { OrnamentsService } from '../../../../../../core/masters/ornaments/services/ornaments.service';


@Component({
  selector: 'kt-ornaments',
  templateUrl: './ornaments.component.html',
  styleUrls: ['./ornaments.component.scss']
})
export class OrnamentsComponent implements OnInit, AfterViewInit, OnChanges {

  selected: number = 0
  goldRate: any;
  @Input() invalid;
  @Input() disable;
  @Input() details;
  @Input() action
  // @Output() OrnamentsDataEmit: EventEmitter<any> = new EventEmitter();
  @Output() next: EventEmitter<any> = new EventEmitter();
  @Output() totalAmt: EventEmitter<any> = new EventEmitter();
  @Input() loanId

  @ViewChild('weightMachineZeroWeight', { static: false }) weightMachineZeroWeight: ElementRef
  @ViewChild('withOrnamentWeight', { static: false }) withOrnamentWeight: ElementRef
  @ViewChild('stoneTouch', { static: false }) stoneTouch: ElementRef
  @ViewChild('acidTest', { static: false }) acidTest: ElementRef
  @ViewChild('purity', { static: false }) purity: ElementRef
  @ViewChild('ornamentImage', { static: false }) ornamentImage: ElementRef
  left: number = 150
  width: number = 0
  ornamentsForm: FormGroup;
  images: any = [];
  karatArr: any
  purityBasedDeduction: number;
  ltvPercent = [];
  url: string
  ornamentType = [];
  totalAmount = 0;
  constructor(
    public fb: FormBuilder,
    public sharedService: SharedService,
    public toast: ToastrService,
    public ele: ElementRef,
    public dilaog: MatDialog,
    public ref: ChangeDetectorRef,
    public goldRateService: GoldRateService,
    public karatService: KaratDetailsService,
    public router: Router,
    public loanApplicationFormService: LoanApplicationFormService,
    public ornamentTypeService: OrnamentsService,
  ) {

  }

  ngOnInit() {
    this.url = this.router.url.split('/')[2]
    this.getKarat()
    this.getOrnamentType()
    this.initForm()
    // this.ornamentsForm.valueChanges.subscribe(() => {
    //   this.OrnamentsDataEmit.emit(this.OrnamentsData)
    // })
  }

  getKarat() {
    this.karatService.getAllKaratDetails().pipe(
      map(res => {
        this.karatArr = res;
        console.log(res)
      })
    ).subscribe()
  }

  getOrnamentType() {
    this.ornamentTypeService.getOrnamentType(1, -1, '').pipe(
      map(res => {
        console.log(res);
        this.ornamentType = res.data;
      })
    ).subscribe();
  }

  initForm() {
    this.ornamentsForm = this.fb.group({
      ornamentData: this.fb.array([])
    })
    this.addmore();
    // this.OrnamentsDataEmit.emit(this.OrnamentsData)

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.details) {
      if (changes.action.currentValue == 'edit') {
        let array = changes.details.currentValue.loanOrnamentsDetail
        for (let index = 0; index < array.length; index++) {
          if (index > 0) {
            this.addmore()
          }
        }
        for (let index = 0; index < array.length; index++) {
          const group = this.OrnamentsData.at(index) as FormGroup
          group.patchValue(array[index])
          this.calcGoldDeductionWeight(index)
          Object.keys(group.value).forEach(key => {
            this.patchUrlIntoForm(key, group.value[key], index)
          })
          this.ref.detectChanges()
        }
      }

    }

    if (this.disable) {
      this.ornamentsForm.disable()
    }
    if (this.invalid) {

      this.ornamentsForm.markAllAsTouched()
    }
  }

  ngAfterViewInit() {
    this.goldRateService.goldRate$.subscribe(res => {
      this.goldRate = res * (75 / 100)
      const group = this.OrnamentsData.at(0) as FormGroup
      group.controls.currentLtvAmount.patchValue(this.goldRate)
    })

    this.ornamentsForm.valueChanges.subscribe(() => {
      if (this.ornamentsForm.valid) {
        this.totalAmount = 0;
        this.OrnamentsData.value.forEach(element => {
          this.totalAmount += Number(element.loanAmount)
        });
        this.totalAmount = Math.round(this.totalAmount)
        this.totalAmt.emit(this.totalAmount)
      }
    })

  }
  get OrnamentsData() {
    if (this.ornamentsForm)
      return this.ornamentsForm.controls.ornamentData as FormArray;
  }

  weightCheck(index) {
    const group = this.OrnamentsData.at(index) as FormGroup;
    if (group.controls.grossWeight.valid) {
      if (Number(group.controls.grossWeight.value) < Number(group.controls.deductionWeight.value)) {
        group.controls.deductionWeight.setErrors({ weight: true })
      } else {
        group.controls.deductionWeight.setErrors(null)
      }
    }
  }

  calcGoldDeductionWeight(index) {
    const group = this.OrnamentsData.at(index) as FormGroup;
    if (group.controls.grossWeight.valid && group.controls.deductionWeight.valid
      && group.controls.grossWeight.value && group.controls.deductionWeight.value) {
      const deductionWeight = Number(group.controls.grossWeight.value) - Number(group.controls.deductionWeight.value);
      group.controls.netWeight.patchValue(deductionWeight.toFixed(2));
      // this.finalNetWeight(index)
      this.calculateLtvAmount(index)
    }
  }

  finalNetWeight(index) {
    const group = this.OrnamentsData.at(index) as FormGroup;
    if (group.controls.purity.valid && group.controls.netWeight.valid) {
      const netWeight = group.controls.netWeight.value - (group.controls.purity.value / 100)
      group.controls.finalNetWeight.patchValue(netWeight)
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
      width.style.maxWidth = left
      const addmore = (this.ele.nativeElement.querySelector('.addmore') as HTMLElement);
      addmore.style.left = left

    }
    this.OrnamentsData.push(this.fb.group({
      ornamentType: [, Validators.required],
      quantity: [, Validators.required],
      grossWeight: ['', [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      netWeight: [, [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      deductionWeight: ['', [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      ornamentImage: [, Validators.required],
      weightMachineZeroWeight: [, Validators.required],
      withOrnamentWeight: [, Validators.required],
      stoneTouch: [, Validators.required],
      acidTest: [, Validators.required],
      karat: ['', Validators.required],
      ltvRange: [[]],
      purityTest: [[], Validators.required],
      ltvPercent: [, [Validators.required]],
      ltvAmount: [],
      loanAmount: [''],
      id: [],
      currentLtvAmount: [this.goldRate]
    }))
    this.createImageArray()
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

  selectKarat(index) {
    const controls = this.OrnamentsData.at(index) as FormGroup;
    controls.controls.ltvPercent.reset()
    controls.controls.ltvPercent.patchValue(null);
    controls.controls.ltvAmount.patchValue(null)
    let karat = this.karatArr.filter(kart => {
      return kart.karat == controls.controls.karat.value
    })
    controls.controls.ltvRange.patchValue(karat[0].range)

    this.ref.detectChanges()
  }

  uploadFile(index, event, string, ) {
    var name = event.target.files[0].name
    var ext = name.split('.')
    if (ext[ext.length - 1] == 'jpg' || ext[ext.length - 1] == 'png' || ext[ext.length - 1] == 'jpeg') {
      this.sharedService.uploadFile(event.target.files[0]).pipe(
        map(res => {
          this.patchUrlIntoForm(string, res.uploadFile.URL, index)
        }),
        catchError(err => {
          this.toast.error(err.error)
          throw err
        })).subscribe();
    } else {
      this.toast.error('Upload Valid File Format')
    }
  }

  patchUrlIntoForm(key, url, index) {
    const controls = this.OrnamentsData.at(index) as FormGroup;
    switch (key) {
      case 'withOrnamentWeight':
        controls.controls.withOrnamentWeight.patchValue(url)
        this.withOrnamentWeight.nativeElement.value = ''
        this.images[index].withOrnamentWeight = url
        break;
      case 'acidTest':
        controls.controls.acidTest.patchValue(url)
        this.acidTest.nativeElement.value = ''
        this.images[index].acidTest = url

        break;
      case 'weightMachineZeroWeight':
        controls.controls.weightMachineZeroWeight.patchValue(url)
        this.weightMachineZeroWeight.nativeElement.value = ''
        this.images[index].weightMachineZeroWeight = url

        break;
      case 'stoneTouch':
        controls.controls.stoneTouch.patchValue(url)
        this.stoneTouch.nativeElement.value = ''
        this.images[index].stoneTouch = url

        break;
      case 'purityTest':
        let temp = []
        if (controls.controls.purityTest.value.length > 0)
          temp = controls.controls.purityTest.value

        if (!temp.includes(url))
          
        if (typeof url == "object") {
          temp = url
        } else {
          temp.push(url)
        }
        this.images[index].purity = temp
        controls.controls.purityTest.patchValue(this.images[index].purity)
        this.purity.nativeElement.value = ''
        break;

      case 'ornamentImage':
        controls.controls.ornamentImage.patchValue(url)
        this.ornamentImage.nativeElement.value = ''
        this.images[index].ornamentImage = url

        break;
    }


  }

  removeImage(key, index, purityIndex) {
    const controls = this.OrnamentsData.at(index) as FormGroup;
    switch (key) {
      case 'withOrnamentWeight':
        controls.controls.withOrnamentWeight.patchValue(null)
        this.images[index].withOrnamentWeight = ''

        break;
      case 'acidTest':
        controls.controls.acidTest.patchValue(null)
        this.images[index].acidTest = ''

        break;
      case 'weightMachineZeroWeight':
        controls.controls.weightMachineZeroWeight.patchValue(null)
        this.images[index].weightMachineZeroWeight = ''

        break;
      case 'stoneTouch':
        controls.controls.stoneTouch.patchValue(null)
        this.images[index].stoneTouch = ''

        break;
      case 'purityTest':
        let temp = controls.controls.purityTest.value
        temp.splice(purityIndex, 1)
        controls.controls.purityTest.patchValue(temp)
        this.images[index].purity = temp

        break;
      case 'ornamentImage':
        controls.controls.ornamentImage.patchValue(null)
        this.images[index].ornamentImage = ''

        break;
    }
  }

  preview(value, formIndex) {
    let filterImage = []
    filterImage = Object.values(this.images[formIndex])

    var temp = []
    let indexof = filterImage.findIndex(idx => {
      return typeof idx == 'object'
    })
    temp = filterImage[indexof]
    filterImage.splice(indexof, 1)
    Array.prototype.push.apply(filterImage, temp)


    temp = filterImage.filter(el => {
      return el != ''
    })
    if (typeof value == 'object') {
      value = value[0]
    }
    let index = temp.indexOf(value)
    this.dilaog.open(ImagePreviewDialogComponent, {
      data: {
        images: temp,
        index: index
      },
      width: "auto"
    })
  }

  calculateLtvAmount(index: number) {
    const controls = this.OrnamentsData.at(index) as FormGroup;
    if (controls.controls.ltvPercent.valid) {
      let ltvPercent = controls.controls.ltvPercent.value
      let ltv = controls.controls.currentLtvAmount.value * (ltvPercent / 100)
      controls.controls.ltvAmount.patchValue(ltv)
      controls.controls.loanAmount.patchValue((ltv * controls.controls.netWeight.value).toFixed(2))
    }
  }

  nextAction() {
    if (this.ornamentsForm.invalid) {
      let array = this.OrnamentsData.controls
      for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (element.invalid) {
          element.markAllAsTouched();
          this.selected = index
          return
        }
      }
      return
    }
    this.loanApplicationFormService.submitOrnaments(this.OrnamentsData.value, this.totalAmount, this.loanId).pipe(
      map(res => {
        let array = this.OrnamentsData.controls
        for (let index = 0; index < array.length; index++) {
          const controls = this.OrnamentsData.at(index) as FormGroup;
          controls.controls.id.patchValue(res.ornaments[index].id)
        }
        this.next.emit(3)
      })
    ).subscribe()
    console.log(this.ornamentsForm.value, this.totalAmount)

  }

}
