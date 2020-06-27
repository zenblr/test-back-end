import { Component, OnInit, ElementRef, Input, ChangeDetectorRef, AfterViewInit, Output, EventEmitter, OnChanges, SimpleChanges, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { SharedService } from '../../../../../../../core/shared/services/shared.service';
import { map, catchError, filter } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material';
import { ImagePreviewDialogComponent } from '../../../../../../partials/components/image-preview-dialog/image-preview-dialog.component';
import { UploadOfferService } from '../../../../../../../core/upload-data';
import { KaratDetailsService } from '../../../../../../../core/loan-setting/karat-details/services/karat-details.service';
import { Router } from '@angular/router';
import { LoanApplicationFormService } from '../../../../../../../core/loan-management';
import { GoldRateService } from '../../../../../../../core/upload-data/gold-rate/gold-rate.service';
import { OrnamentsService } from '../../../../../../../core/masters/ornaments/services/ornaments.service';
import { WebcamDialogComponent } from '../../../../kyc-settings/webcam-dialog/webcam-dialog.component';
import { LayoutUtilsService } from '../../../../../../../core/_base/crud';
import { GlobalSettingService } from '../../../../../../../core/global-setting/services/global-setting.service';


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
  @Input() ornamentType
  @ViewChild('weightMachineZeroWeight', { static: false }) weightMachineZeroWeight: ElementRef
  @ViewChild('withOrnamentWeight', { static: false }) withOrnamentWeight: ElementRef
  @ViewChild('stoneTouch', { static: false }) stoneTouch: ElementRef
  @ViewChild('acidTest', { static: false }) acidTest: ElementRef
  @ViewChild('purity', { static: false }) purity: ElementRef
  @ViewChild('ornamentImage', { static: false }) ornamentImage: ElementRef
  left: number = 0
  width: number = 0
  ornamentsForm: FormGroup;
  images: any = [];
  karatArr: any
  purityBasedDeduction: number;
  ltvPercent = [];
  url: string
  totalAmount = 0;
  addmoreMinus: any;
  globalValue: any;
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
    public layoutUtilsService: LayoutUtilsService,
    public globalSettingService: GlobalSettingService
  ) {

  }

  ngOnInit() {

    this.url = this.router.url.split('/')[2]
    this.getKarat()
    this.initForm()
  }

  getKarat() {
    this.karatService.getAllKaratDetails().pipe(
      map(res => {
        this.karatArr = res;
        console.log(res)
      })
    ).subscribe()
  }



  initForm() {
    this.ornamentsForm = this.fb.group({
      ornamentData: this.fb.array([])
    })
    this.addmore();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.ornamentType) {
      this.ornamentType = changes.ornamentType.currentValue
    }
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
    this.globalSettingService.globalSetting$.subscribe(global => {
      this.globalValue = global;
      if (global) {
        this.goldRateService.goldRate$.subscribe(res => {
          this.goldRate = res * (this.globalValue.ltvGoldValue / 100)
          const group = this.OrnamentsData.at(0) as FormGroup
          group.controls.currentLtvAmount.patchValue(this.goldRate)
        })
      }
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
    if (this.left < 71) {
      if (this.OrnamentsData.length == 0) {
        this.left = 12
        var left = '12rem'
      } else {
        this.left = this.left + 10
      }
      left = (this.left).toString() + 'rem'
      const addmore = (this.ele.nativeElement.querySelector('.addmore') as HTMLElement);
      addmore.style.left = left
      this.addmoreMinus = false
    } else {
      const addmore = (this.ele.nativeElement.querySelector('.addmore') as HTMLElement);
      addmore.style.left = 'unset'
      addmore.style.right = '0px'
      this.addmoreMinus = true
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
      currentLtvAmount: [this.goldRate],
      ornamentImageData: [, Validators.required],
      weightMachineZeroWeightData: [, Validators.required],
      withOrnamentWeightData: [, Validators.required],
      stoneTouchData: [, Validators.required],
      acidTestData: [, Validators.required],
      purityTestData: [[], Validators.required],
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

  deleteOrnaments(idx) {
    const _title = 'Delete Ornament';
    const _description = 'Are you sure you want to permanently delete this Ornament?';
    const _waitDesciption = 'Ornament is deleting...';
    const _deleteMessage = `Ornament has been deleted`;
    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.removeOrnaments(idx)
      }
    });
  }

  removeOrnaments(idx) {
    this.images.splice(idx, 1)
    this.OrnamentsData.removeAt(idx)
    this.ref.markForCheck()
    const pagination = (this.ele.nativeElement.querySelector('.mat-tab-header-pagination-controls-enabled') as HTMLElement);
    if (!pagination) {
      if (this.addmoreMinus) {
        this.addmoreMinus = false
      } else {
        this.left = this.left - 10;
      }
      var left = (this.left).toString() + 'rem'
      const addmore = (this.ele.nativeElement.querySelector('.addmore') as HTMLElement);
      addmore.style.left = left
      addmore.style.right = 'unset'

    }
    setTimeout(() => {
      const translate = (this.ele.nativeElement.querySelector('.mat-tab-list') as HTMLElement);
      if (translate)
        translate.style.transform = 'translateX(0px)'
    })
    this.ref.markForCheck()
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
      this.sharedService.uploadFile(event.target.files[0],'loan').pipe(
        map(res => {
          this.patchUrlIntoForm(string, res.uploadFile.id, index)
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
      case 'withOrnamentWeightData':
        controls.controls.withOrnamentWeight.patchValue(url.id)
        controls.controls.withOrnamentWeightData.patchValue(url.url)
        this.withOrnamentWeight.nativeElement.value = ''
        // this.images[index].withOrnamentWeight = url
        this.images[index].withOrnamentWeight = controls.controls.withOrnamentWeightData.value
        break;
      case 'acidTestData':
        controls.controls.acidTest.patchValue(url)
        this.acidTest.nativeElement.value = ''
        // this.images[index].acidTest = url
        this.images[index].acidTest = controls.controls.acidTestData.value.url
        break;
      case 'weightMachineZeroWeightData':
        controls.controls.weightMachineZeroWeight.patchValue(url.id)
        controls.controls.weightMachineZeroWeightData.patchValue(url.url)
        this.weightMachineZeroWeight.nativeElement.value = ''
        // this.images[index].weightMachineZeroWeight = url
        this.images[index].weightMachineZeroWeight = controls.controls.weightMachineZeroWeightData.value
        break;
      case 'stoneTouchData':
        controls.controls.stoneTouch.patchValue(url.id)
        controls.controls.stoneTouchData.patchValue(url.url)
        this.stoneTouch.nativeElement.value = ''
        // this.images[index].stoneTouch = url
        this.images[index].stoneTouch = controls.controls.stoneTouchData.value
        break;
      case 'purityTest':
        let temp = []
        if (controls.controls.purityTest.value.length > 0)
          temp = controls.controls.purityTest.value

        if (!temp.includes(url))

          if (typeof url == "object") {
            temp = url
            // url.forEach(element => {
            //   temp.push(element.purityTest.url)
            // });
          } else {
            temp.push(url)
          }
        this.images[index].purity = temp
        controls.controls.purityTest.patchValue(this.images[index].purity)
        this.purity.nativeElement.value = ''
        break;

      case 'ornamentImageData':
        controls.controls.ornamentImage.patchValue(url.id)
        controls.controls.ornamentImageData.patchValue(url.url)
        this.ornamentImage.nativeElement.value = ''
        // this.images[index].ornamentImage = url
        this.images[index].ornamentImage = controls.controls.ornamentImageData.value.url
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

  webcam(index, event, string) {
    const dialogRef = this.dilaog.open(WebcamDialogComponent,
      {
        data: {},
        width: '500px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.sharedService.uploadBase64File(res.imageAsDataUrl).subscribe(res => {
          console.log(res)
          this.patchUrlIntoForm(string, res.uploadFile, index)
        })
      }
    });
  }

}
