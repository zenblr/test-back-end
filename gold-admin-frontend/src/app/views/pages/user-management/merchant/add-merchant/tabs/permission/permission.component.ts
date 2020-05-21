
import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { ToastrComponent } from '../../../../../../../views/partials/components/toastr/toastr.component';
import { map, catchError } from 'rxjs/operators';
import { MerchantService } from '../../../../../../../core/user-management/merchant';
import { MatCheckbox } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'kt-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.scss']
})
export class PermissionComponent implements OnInit, AfterViewInit {

  @ViewChild('checkboxThree', { static: false }) checkboxThree: ElementRef
  @ViewChild('checkboxTwo', { static: false }) checkboxTwo: ElementRef
  @ViewChild('checkboxOne', { static: false }) checkboxOne: ElementRef
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  @ViewChildren('sub') subProduct: QueryList<any>;
  @ViewChildren('pro') product: QueryList<any>;

  permissions: any[] = []
  checkedCategory: any[] = []
  checkedSubCategory: any[] = [];
  checkedProduct: any = [];
  selectAll = { cat: false, subCat: false, pro: false }
  userId: number = null;
  isEdit: boolean = true;
  lengthOf = { category: 0, subCategory: 0, product: 0 }
  editMerchant = false;

  constructor(
    private merchantService: MerchantService,
    private ref: ChangeDetectorRef,
    private rout: ActivatedRoute,
    private router: Router,
    private ele: ElementRef
  ) {
    this.merchantService.userId$.subscribe(res => {
      this.userId = res;
    })
  }

  ngOnInit() {
    var id = this.rout.snapshot.params.id;
    if (id) {
      this.userId = id;
      this.editMerchant = true;
    }
    this.getData()
  }

  ngAfterViewInit() {

  }


  getData() {
    this.merchantService.getPermission(this.userId).pipe(
      map(res => {
        this.permissions = res;
        this.calculateInitLength()
        this.ref.detectChanges();
      })
    ).subscribe()
  }


  calculateInitLength() {
    this.permissions.forEach(ele => {
      this.lengthOf.category += 1
      if (ele.isSelected)
        this.checkedCategory.push(ele)
      ele.subCategory.forEach(sub => {
        this.lengthOf.subCategory += 1
        if (sub.isSelected)
          this.checkedSubCategory.push(sub)
        sub.products.forEach(pro => {
          this.lengthOf.product += 1
          if (pro.isSelected)
            this.checkedProduct.push(pro.id)
        })
      })
    })
    this.checked('all')
  }

  calculateLength() {
    this.lengthOf = { category: 0, subCategory: 0, product: 0 }
    this.permissions.forEach(ele => {
      this.lengthOf.category += 1
      ele.subCategory.forEach(sub => {
        if (ele.isSelected) {
          this.lengthOf.subCategory += 1
          sub.products.forEach(() => {
            if (sub.isSelected) {
              this.lengthOf.product += 1
            }
          })
        }
      })
    })
  }

  isSelectedFalse() {
    this.permissions.forEach(ele => {
      ele.isSelected = false;
      ele.subCategory.forEach(sub => {
        sub.isSelected = false;
        sub.products.forEach(pro => {
          pro.isSelected = false;
        })
      })
    })
  }

  isSelectedTrue() {
    this.permissions.forEach(ele => {
      ele.isSelected = true;
      this.checkedCategory.push(ele);
      ele.subCategory.forEach(sub => {
        sub.isSelected = true;
        this.checkedSubCategory.push(sub)
        sub.products.forEach(prod => {
          prod.isSelected = true;
          this.checkedProduct.push(prod.id)
        })
      })
    })
  }

  categoryCheckBox(checked: MatCheckbox, index: number) {
    if (checked) {
      this.permissions[index].isSelected = true
      this.permissions[index].subCategory.forEach(sub => {
        sub.isSelected = true
      })
    } else if (!checked) {
      this.permissions[index].isSelected = false
      this.permissions[index].subCategory.forEach(sub => {
        sub.isSelected = false
      })
    }
    this.checkedCategory = this.permissions.filter(cat => {
      return cat.isSelected
    })
    this.checkedProduct = []
    this.checkedSubCategory = []
    this.permissions.forEach(cat => {
      cat.subCategory.forEach(sub => {
        if (sub.isSelected){
          this.checkedSubCategory.push(sub)
          sub.products.forEach(pro=>{
            pro.isSelected = true
            this.checkedProduct.push(pro.id)
          })
        }
          
      })
    })
    this.calculateLength()
    this.checked('cat')
  }



  subCategoryCheckBox(checked: MatCheckbox, catIndex: number, subIndex: number) {
    if (checked) {
      this.permissions[catIndex].subCategory[subIndex].isSelected = true
    } else if (!checked) {
      this.permissions[catIndex].subCategory[subIndex].isSelected = false
    }
    this.checkedProduct = []
    this.checkedSubCategory = []
    this.permissions.forEach(cat => {
      cat.subCategory.forEach(sub => {
        if (sub.isSelected){
          this.checkedSubCategory.push(sub)
          sub.products.forEach(pro=>{
            pro.isSelected = true
            this.checkedProduct.push(pro.id)
          })
        }
          
      })
    })
    this.calculateLength()
    this.checked('sub')
  }

  generateProduct(checked: MatCheckbox, catIndex: number, subIndex: number, index: number) {
    var pro = this.permissions[catIndex].subCategory[subIndex].products[index]
    if (checked) {
      this.checkedProduct.push(pro.id)
      pro.isSelected = true
    } else if (!checked) {
      var indexOfProId = this.checkedProduct.indexOf(pro.id);
      this.checkedProduct.splice(indexOfProId, 1)
      pro.isSelected = false
    }
    this.calculateLength()
    this.checked('pro')

  }

  selectAllCat(event: MatCheckbox, type) {
    this.checkedCategory = []
    this.checkedSubCategory = []
    this.checkedProduct = []
    if (event) {
      this.selectAll = { cat: true, subCat: true, pro: true }
      this.isSelectedTrue()

    } else {
      this.selectAll = { cat: false, subCat: false, pro: false }
      this.isSelectedFalse()
    }
    this.calculateLength()
    this.checked('cat')

  }


  selectAllSub(event: MatCheckbox) {
    this.checkedProduct = []
    this.checkedSubCategory = []
    if (event) {
      this.selectAll.subCat = true;
      this.selectAll.pro = true
      this.permissions.forEach(cat => {
        if (cat.isSelected) {
          cat.subCategory.forEach(sub => {
            this.checkedSubCategory.push(sub)
            sub.isSelected = true
            sub.products.forEach(pro => {
              this.checkedProduct.push(pro.id)
              pro.isSelected = true
            })
          })
        }
      })
    } else {
      this.selectAll.subCat = false,
        this.selectAll.pro = false
      this.permissions.forEach(cat => {
        cat.subCategory.forEach(sub => {
          sub.isSelected = false
          sub.products.forEach(pro => {
            pro.isSelected = false
          })
        })
      })
    }
    this.calculateLength()
    this.checked('sub')
  }

  selectAllProd(event: MatCheckbox) {
    this.checkedProduct = []
    if (event) {
      this.permissions.forEach(ele => {
        ele.subCategory.forEach(sub => {
          if (sub.isSelected) {
            sub.products.forEach(pro => {
              pro.isSelected = true
              this.checkedProduct.push(pro.id)
            });
          }
        });
      })
    } else {
      this.selectAll.pro = false
      this.permissions.forEach(ele => {
        ele.subCategory.forEach(sub => {
          sub.products.forEach(pro => {
            pro.isSelected = false
          });
        });
      })
    }
    this.calculateLength()
    this.checked('pro')
  }

  selectParticularCat(checked, catIndex) {
    for (let index = 0; index < this.permissions[catIndex].subCategory.length; index++) {
      this.subCategoryCheckBox(checked, catIndex, index)
    }
    console.log();
  }

  subLength(catIndex) {
    let index = 0;
    this.permissions[catIndex].subCategory.forEach(sub => {
      if (sub.isSelected)
        index++;
    });
    let sub = this.subProduct.toArray()

    if (index == this.permissions[catIndex].subCategory.length) {
      if (sub[catIndex]) {
        console.log()
        sub[catIndex].nativeElement.classList.remove('checkmark2')
        sub[catIndex].nativeElement.classList.add('checkmark')
      }
      return true
    } else if (index > 0) {
      if (sub[catIndex]) {
        console.log()
        sub[catIndex].nativeElement.classList.add('checkmark2')
        sub[catIndex].nativeElement.classList.remove('checkmark')
      }
      return true
    }
    else if (index == 0) {
      return false
    }
  }

  selectParicularSubCatPro(checked, catIndex, subIndex) {
    for (let index = 0; index < this.permissions[catIndex].subCategory[subIndex].products.length; index++) {
      this.generateProduct(checked, catIndex, subIndex, index)
    }
  }

  productLength(catIndex, subIndex) {
    let index = 0;
    this.permissions[catIndex].subCategory[subIndex].products.forEach(sub => {
      if (sub.isSelected)
        index++;
    });
    let pro = this.product.toArray()
    if (index == this.permissions[catIndex].subCategory[subIndex].products.length) {

      if (pro[subIndex]) {
        console.log()
        pro[subIndex].nativeElement.classList.remove('checkmark2')
        pro[subIndex].nativeElement.classList.add('checkmark')
      }
      return true
    } else if (index > 0) {
      if (pro[subIndex]) {
        console.log()
        pro[subIndex].nativeElement.classList.add('checkmark2')
        pro[subIndex].nativeElement.classList.remove('checkmark')
      }
      return true
    }
    else if (index == 0) {
      return false
    }
  }

  checked(type) {

    if (type == 'cat' || type == 'all') {

      if (this.lengthOf.category == this.checkedCategory.length) {
        this.selectAll = { cat: true, subCat: true, pro: true }
        this.checkboxOne.nativeElement.classList.remove('checkmark2')
        this.checkboxOne.nativeElement.classList.add('checkmark')
      } else if (this.checkedCategory.length > 0) {
        this.selectAll = { cat: true, subCat: true, pro: true }
        this.checkboxOne.nativeElement.classList.remove('checkmark')
        this.checkboxOne.nativeElement.classList.add('checkmark2')
      } else if (this.checkedCategory.length == 0) {
        this.selectAll = { cat: false, subCat: false, pro: false }
      }

    } else if (type == 'sub' || type == 'all') {

      if (this.lengthOf.subCategory == this.checkedSubCategory.length) {
        this.selectAll.subCat = true;
        this.selectAll.pro = true
        this.checkboxTwo.nativeElement.classList.remove('checkmark2')
        this.checkboxTwo.nativeElement.classList.add('checkmark')
      } else if (this.checkedSubCategory.length > 0) {
        this.selectAll.subCat = true;
        this.selectAll.pro = true
        this.checkboxTwo.nativeElement.classList.remove('checkmark')
        this.checkboxTwo.nativeElement.classList.add('checkmark2')
      } else if (this.checkedSubCategory.length == 0) {
        this.selectAll.pro = false;
        this.selectAll.subCat = false;

      }

    } else if (type == 'pro' || type == 'all') {

      if (this.lengthOf.product == this.checkedProduct.length) {
        this.selectAll.pro = true
        this.checkboxThree.nativeElement.classList.remove('checkmark2')
        this.checkboxThree.nativeElement.classList.add('checkmark')
        this.selectAll.pro = true;
      } else if (this.checkedProduct.length > 0) {
        this.selectAll.pro = true;
        this.checkboxThree.nativeElement.classList.remove('checkmark')
        this.checkboxThree.nativeElement.classList.add('checkmark2')
      } else if (this.checkedProduct.length == 0) {
        this.selectAll.pro = false;
      }
    }
  }

  submit(event) {
    var isSelected = false;
    if (this.lengthOf.product == this.checkedProduct.length &&
      this.lengthOf.subCategory == this.checkedSubCategory.length &&
      this.lengthOf.category == this.checkedCategory.length) {
      isSelected = true;
    } else {
      isSelected = false;
    }
    if (event) {
      this.merchantService.addProduct(this.checkedProduct, isSelected, this.userId).pipe(
        map(res => {
          this.toastr.successToastr(res.message)
          this.router.navigate(['/user-management/merchant'])
        }),
        catchError(err => {
          this.toastr.errorToastr(err.error.message)
          throw err
        })).subscribe()
    }
  }

}
