import { Component, OnInit, ElementRef, Input, ChangeDetectorRef, AfterViewInit, Output, EventEmitter, OnChanges, SimpleChanges, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material';
import { ImagePreviewDialogComponent } from '../../../../../../views/partials/components/image-preview-dialog/image-preview-dialog.component';
import { UploadOfferService } from '../../../../../../core/upload-data';
import { KaratDetailsService } from '../../../../../../core/loan-setting/karat-details/services/karat-details.service';
import { Router } from '@angular/router';
import { LoanApplicationFormService } from '../../../../../../core/loan-management';


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
  @Output() OrnamentsDataEmit: EventEmitter<any> = new EventEmitter();
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
  // karatArr = [{ value: 18, name: '18 K' },
  // { value: 19, name: '19 K' },
  // { value: 20, name: '20 K' },
  // { value: 21, name: '21 K' },
  // { value: 22, name: '22 K' }]
  karatArr: any
  purityBasedDeduction: number;
  ltvPercent = [];
  url: string
  ornamentType = [];
  constructor(
    public fb: FormBuilder,
    public sharedService: SharedService,
    public toast: ToastrService,
    public ele: ElementRef,
    public dilaog: MatDialog,
    public ref: ChangeDetectorRef,
    public uploadOfferService: UploadOfferService,
    public karatService: KaratDetailsService,
    public router: Router,
    public loanApplicationFormService: LoanApplicationFormService
  ) {

  }

  ngOnInit() {
    this.url = this.router.url.split('/')[2]
    this.getKarat()
    this.getOrnamentType()
    this.initForm()
    this.ornamentsForm.valueChanges.subscribe(() => {
      this.OrnamentsDataEmit.emit(this.OrnamentsData)
    })
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
    this.loanApplicationFormService.getOrnamentType().pipe(
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
    this.OrnamentsDataEmit.emit(this.OrnamentsData)

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.details) {
      if (changes.action.currentValue == 'edit') {
        let array = changes.details.currentValue.loanOrnamentsDetail
        for (let index = 0; index < array.length; index++) {
          if (index > 0) {
            this.addmore()
          }
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
      this.goldRate = res * (75 / 100)
      const group = this.OrnamentsData.at(0) as FormGroup
      group.controls.currentLtvAmount.patchValue(this.goldRate)
    })
  }
  get OrnamentsData() {
    if (this.ornamentsForm)
      return this.ornamentsForm.controls.ornamentData as FormArray;
  }

  weightCheck(index){
    const group = this.OrnamentsData.at(index) as FormGroup;
    if(group.controls.grossWeight.valid){
      if(Number(group.controls.grossWeight.value) < Number(group.controls.netWeight.value)){
        group.controls.netWeight.setErrors({weight:true})
      }else{
        group.controls.netWeight.setErrors(null)
      }
    }
  }

  calcGoldDeductionWeight(index) {
    const group = this.OrnamentsData.at(index) as FormGroup;
    if (group.controls.grossWeight.valid && group.controls.netWeight.valid) {
      const deductionWeight = group.controls.grossWeight.value - group.controls.netWeight.value;
      group.controls.deductionWeight.patchValue(deductionWeight);
      this.finalNetWeight(index)
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
      grossWeight: [, [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      netWeight: [, [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      deductionWeight: [, [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      ornamentImage: [, Validators.required],
      weightMachineZeroWeight: [, Validators.required],
      withOrnamentWeight: [, Validators.required],
      stoneTouch: [, Validators.required],
      acidTest: [, Validators.required],
      karat: ['', Validators.required],
      purity: [, [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      ltvRange: [[]],
      finalNetWeight: [''],
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
    const controls = this.OrnamentsData.at(index) as FormGroup;;
    controls.controls.ltvPercent.patchValue('');
    controls.controls.ltvAmount.patchValue(null)
    let karat = this.karatArr.filter(kart => {
      return kart.karat == controls.controls.karat.value
    })
    controls.controls.ltvRange.patchValue(karat[0].range)
    // switch (controls.controls.karat.value) {
    //   case '18':
    //     this.ltvPercent = ['75', '76', '77', '78', '79'];
    //     controls.controls.ltvRange.patchValue(this.ltvPercent)
    //     this.purityBasedDeduction = 7.5;
    //     controls.controls.purity.patchValue(this.purityBasedDeduction);
    //     break;
    //   case '19':
    //     this.ltvPercent = ['80', '81', '82', '83', '84'];
    //     controls.controls.ltvRange.patchValue(this.ltvPercent)
    //     this.purityBasedDeduction = 5;
    //     controls.controls.purity.patchValue(this.purityBasedDeduction);
    //     break;
    //   case '20':
    //     this.ltvPercent = ['85', '86', '87', '88', '89'];
    //     controls.controls.ltvRange.patchValue(this.ltvPercent)
    //     this.purityBasedDeduction = 2;
    //     controls.controls.purity.patchValue(this.purityBasedDeduction);
    //     break;
    //   case '21':
    //     this.ltvPercent = ['90', '91', '92', '93', '94'];
    //     controls.controls.ltvRange.patchValue(this.ltvPercent)
    //     this.purityBasedDeduction = 1.5;
    //     controls.controls.purity.patchValue(this.purityBasedDeduction);
    //     break;
    //   case '22':
    //     this.ltvPercent = ['95', '96', '97', '98', '99', '100'];
    //     controls.controls.ltvRange.patchValue(this.ltvPercent)
    //     this.purityBasedDeduction = 1;
    //     controls.controls.purity.patchValue(this.purityBasedDeduction);
    //     break;
    //   default:
    //     break;
    // }
    this.ref.detectChanges()
    this.finalNetWeight(index)
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
        // if (controls.controls.purityTest.value.length > 0)
        //   temp = controls.controls.purityTest.value
        temp.push(url)
        if (typeof url == "object") {
          this.images[index].purity = url[0]
        } else {
          this.images[index].purity = url
        }
        controls.controls.purityTest.patchValue([this.images[index].purity])
        this.purity.nativeElement.value = ''


        break;

      case 'ornamentImage':
        controls.controls.ornamentImage.patchValue(url)
        this.ornamentImage.nativeElement.value = ''
        this.images[index].ornamentImage = url

        break;
    }


  }

  removeImage(key, index, value) {
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
      case 'purity':
        controls.controls.purityTest.patchValue([])
        this.images[index].purityTest = ''

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
    temp = filterImage.filter(el => {
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

  calculateLtvAmount(index: number) {
    const controls = this.OrnamentsData.at(index) as FormGroup;
    if (controls.controls.finalNetWeight.valid && controls.controls.purity.valid
      && controls.controls.ltvPercent.valid) {
      let ltvPercent = controls.controls.ltvPercent.value
      let ltv = controls.controls.currentLtvAmount.value * (ltvPercent / 100)
      controls.controls.ltvAmount.patchValue(ltv)
      controls.controls.loanAmount.patchValue((ltv * controls.controls.finalNetWeight.value).toFixed(2))
    }
  }
}
