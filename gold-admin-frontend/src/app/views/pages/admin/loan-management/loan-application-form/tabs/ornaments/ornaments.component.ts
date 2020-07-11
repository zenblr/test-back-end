import { Component, OnInit, ElementRef, Input, ChangeDetectorRef, AfterViewInit, Output, EventEmitter, OnChanges, SimpleChanges, ViewChildren, QueryList, ViewChild, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { SharedService } from '../../../../../../../core/shared/services/shared.service';
import { map, catchError, filter } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
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
  ltvGoldRate:any;
  @Input() invalid;
  @Input() disable;
  @Input() details;
  @Input() action
  // @Output() OrnamentsDataEmit: EventEmitter<any> = new EventEmitter();
  @Output() next: EventEmitter<any> = new EventEmitter();
  @Output() totalAmt: EventEmitter<any> = new EventEmitter();
  @Output() fullAmt: EventEmitter<any> = new EventEmitter();
  @Input() masterAndLoanIds
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
  purityTestPath: any = [];
  purityTestImg: any = [];
  fullAmount: number;

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
    public globalSettingService: GlobalSettingService,
    public dialogRef: MatDialogRef<OrnamentsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
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
          // this.calcGoldDeductionWeight(index)
          Object.keys(group.value).forEach(key => {

            if (key == 'purityTestImage') {
              let data = this.createPurityImageArray(group.value.purityTestImage)
              this.patchUrlIntoForm(key, data.path, data.URL, index)

            } else {
              if (group.value[key])
                this.patchUrlIntoForm(key, group.value[key].path, group.value[key].URL, index)
            }

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
          this.goldRate =res;
          this.ltvGoldRate = res * (this.globalValue.ltvGoldValue / 100)
          const group = this.OrnamentsData.at(0) as FormGroup
          group.controls.currentLtvAmount.patchValue(this.ltvGoldRate)
          group.controls.currentGoldRate.patchValue(res)
        })
      }
    })

    this.ornamentsForm.valueChanges.subscribe(() => {
      if (this.ornamentsForm.valid) {
        this.totalAmount = 0;
        this.fullAmount =0;
        this.OrnamentsData.value.forEach(element => {
          this.totalAmount += Number(element.loanAmount)
          this.fullAmount +=Number(element.ornamentFullAmount)
        });
        console.log(this.fullAmount)
        this.totalAmount = Math.round(this.totalAmount)
        this.fullAmount = Math.round(this.fullAmount)
        this.totalAmt.emit(this.totalAmount)
        this.fullAmt.emit(this.fullAmount)
      }
    })

  }
  get OrnamentsData() {
    if (this.ornamentsForm)
      return this.ornamentsForm.controls.ornamentData as FormArray;
  }

  createPurityImageArray(purity) {
    let data = { URL: [], path: [] }
    // console.log(purity)
    data = purity
    // purity.forEach(pure => {
    //   data.URL.push(pure.purityTest.URL)
    //   data.path.push(pure.purityTest.path)
    // });

    return data
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
      ornamentTypeId: [, Validators.required],
      quantity: [, Validators.required],
      grossWeight: ['', [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      netWeight: [, [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      deductionWeight: ['', [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      ornamentImage: [, Validators.required],
      weightMachineZeroWeight: [],
      withOrnamentWeight: [],
      stoneTouch: [],
      acidTest: [],
      karat: ['', Validators.required],
      ltvRange: [[]],
      purityTest: [[]],
      ltvPercent: [, [Validators.required]],
      ltvAmount: [],
      loanAmount: [''],
      id: [],
      currentLtvAmount: [this.ltvGoldRate],
      ornamentImageData: [, Validators.required],
      weightMachineZeroWeightData: [],
      withOrnamentWeightData: [],
      stoneTouchData: [],
      acidTestData: [],
      purityTestImage: [[]],
      ornamentFullAmount:[],
      currentGoldRate:[this.goldRate]
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

  uploadFile(index, event, string,) {
    var name = event.target.files[0].name
    var ext = name.split('.')
    if (ext[ext.length - 1] == 'jpg' || ext[ext.length - 1] == 'png' || ext[ext.length - 1] == 'jpeg') {
      const params = {
        reason: 'loan'
      }
      this.sharedService.uploadFile(event.target.files[0], params).pipe(
        map(res => {
          this.patchUrlIntoForm(string, res.uploadFile.path, res.uploadFile.URL, index)
        }),
        catchError(err => {
          this.toast.error(err.error)
          throw err
        })).subscribe();
    } else {
      this.toast.error('Upload Valid File Format')
    }
  }

  patchUrlIntoForm(key, id, url, index) {
    const controls = this.OrnamentsData.at(index) as FormGroup;
    switch (key) {
      case 'withOrnamentWeightData':
        controls.controls.withOrnamentWeight.patchValue(id)
        controls.controls.withOrnamentWeightData.patchValue(url)
        this.withOrnamentWeight.nativeElement.value = ''
        this.images[index].withOrnamentWeight = url
        // this.images[index].withOrnamentWeight = controls.controls.withOrnamentWeightData.value
        break;
      case 'acidTestData':
        controls.controls.acidTest.patchValue(id)
        controls.controls.acidTestData.patchValue(url)
        this.acidTest.nativeElement.value = ''
        this.images[index].acidTest = url
        // this.images[index].acidTest = controls.controls.acidTestData.value
        break;
      case 'weightMachineZeroWeightData':
        controls.controls.weightMachineZeroWeight.patchValue(id)
        controls.controls.weightMachineZeroWeightData.patchValue(url)
        this.weightMachineZeroWeight.nativeElement.value = ''
        this.images[index].weightMachineZeroWeight = url
        // this.images[index].weightMachineZeroWeight = controls.controls.weightMachineZeroWeightData.value
        break;
      case 'stoneTouchData':
        controls.controls.stoneTouch.patchValue(id)
        controls.controls.stoneTouchData.patchValue(url)
        this.stoneTouch.nativeElement.value = ''
        this.images[index].stoneTouch = url
        // this.images[index].stoneTouch = controls.controls.stoneTouchData.value
        break;
      case 'purityTestImage':
        if (url) {

          if (typeof url == "object") {

            this.purityTestImg = url
            this.purityTestPath = id

          } else {
            this.purityTestImg = controls.controls.purityTestImage.value
            this.purityTestPath = controls.controls.purityTest.value
            this.purityTestImg.push(url)
            this.purityTestPath.push(id)
          }
          this.images[index].purity = this.purityTestImg
          controls.controls.purityTest.patchValue(this.purityTestPath)
          controls.controls.purityTestImage.patchValue(this.purityTestImg)
          this.purity.nativeElement.value = ''
        }
        // } else {
        //   this.toast.error('Maximum of 4 Images can be uploaded in Purity Test')
        // }
        break;
      case 'ornamentImageData':
        controls.controls.ornamentImage.patchValue(id)
        controls.controls.ornamentImageData.patchValue(url)
        this.ornamentImage.nativeElement.value = ''
        this.images[index].ornamentImage = url
        // this.images[index].ornamentImage = controls.controls.ornamentImageData.value
        break;
    }

  }

  removeImage(key, index, purityIndex) {
    const controls = this.OrnamentsData.at(index) as FormGroup;
    switch (key) {
      case 'withOrnamentWeight':
        controls.controls.withOrnamentWeight.patchValue(null)
        controls.controls.withOrnamentWeightData.patchValue(null)
        this.images[index].withOrnamentWeight = ''

        break;
      case 'acidTest':
        controls.controls.acidTest.patchValue(null)
        controls.controls.acidTestData.patchValue(null)
        this.images[index].acidTest = ''

        break;
      case 'weightMachineZeroWeight':
        controls.controls.weightMachineZeroWeight.patchValue(null)
        controls.controls.weightMachineZeroWeightData.patchValue(null)
        this.images[index].weightMachineZeroWeight = ''

        break;
      case 'stoneTouch':
        controls.controls.stoneTouch.patchValue(null)
        controls.controls.stoneTouchData.patchValue(null)
        this.images[index].stoneTouch = ''

        break;
      case 'purityTestImage':
        let temp = controls.controls.purityTest.value
        let tempUrl = controls.controls.purityTestImage.value
        temp.splice(purityIndex, 1)
        tempUrl.splice(purityIndex, 1)
        controls.controls.purityTest.patchValue(temp)
        controls.controls.purityTestImage.patchValue(tempUrl)
        this.images[index].purity = tempUrl

        break;
      case 'ornamentImage':
        controls.controls.ornamentImage.patchValue(null)
        controls.controls.ornamentImageData.patchValue(null)
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
      let fullAmount = controls.controls.currentGoldRate.value * (ltvPercent / 100)
      controls.controls.ornamentFullAmount.patchValue((fullAmount * controls.controls.netWeight.value).toFixed(2))
      console.log(controls.controls.ornamentFullAmount.value)
    }
    console.log(this.OrnamentsData.value)
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
    this.loanApplicationFormService.submitOrnaments(this.OrnamentsData.value, this.totalAmount, this.masterAndLoanIds,this.fullAmount).pipe(
      map(res => {
        let array = this.OrnamentsData.controls
        for (let index = 0; index < array.length; index++) {
          const controls = this.OrnamentsData.at(index) as FormGroup;
          controls.controls.id.patchValue(res.ornaments[index].id)
        }
        this.next.emit(3)
      })
    ).subscribe()

  }

  webcam(index, event, string) {
    const controls = this.OrnamentsData.at(index) as FormGroup;
    const dialogRef = this.dilaog.open(WebcamDialogComponent,
      {
        data: {},
        width: '500px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        const params = {
          reason: 'loan',
          masterLoanId: this.masterAndLoanIds.masterLoanId
        }
        if (string == 'purityTestImage') {
          if (controls.controls.purityTest.value.length >= 4) {
            this.toast.error('Maximum of 4 Images can be uploaded in Purity Test')
            return
          }
        }
        this.sharedService.uploadBase64File(res.imageAsDataUrl, params).subscribe(res => {
          this.patchUrlIntoForm(string, res.uploadFile.path, res.uploadFile.URL, index)
        })

      }
    });
  }

  isArray(obj: any) {
    return Array.isArray(obj)
  }

}
