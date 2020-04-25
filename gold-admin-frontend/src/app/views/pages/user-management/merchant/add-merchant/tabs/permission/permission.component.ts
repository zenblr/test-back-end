import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, OnInit, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { ToastrComponent } from '../../../../../../../views/partials/components/toastr/toastr.component';
import { map } from 'rxjs/operators';
import { MerchantService } from '../../../../../../../core/user-management/merchant';
import { MatCheckbox } from '@angular/material';


@Component({
  selector: 'kt-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.scss']
})
export class PermissionComponent implements OnInit {

  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  permissions: any[] = []
  checkedCategory: any[] = []
  checkedSubCategory: any[] = [];
  checkedProduct: any = [];
  selectAllArray: boolean []= []
  constructor(
    private merchantService: MerchantService,
    private ref: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.getData()
    for (let index = 0; index < 3; index++) {
      this.selectAllArray.push(false);
    }
  }
  getData() {
    this.merchantService.getPermission().pipe(
      map(res => {
        console.log(res)
        this.permissions = res;
        this.addIsChecked()
        this.ref.detectChanges();
      })
    ).subscribe()
  }

  addIsChecked() {
    this.permissions.forEach(ele => {
      ele.isChecked = false;
      ele.subCategory.forEach(sub => {
        sub.isChecked = false;
        sub.products.forEach(pro => {
          pro.isChecked = false;
        })
      })
    })
  }

  categoryCheckBox(checked: MatCheckbox, checkedCategory: any[], index: number) {
    console.log(checked)
    if (checked) {
      this.checkedCategory.push(checkedCategory)
    } else if (!checked) {
      var idx = this.checkedSubCategory.findIndex(ele => {
        return ele.categoryId == this.checkedCategory[index].id
      })
      this.checkedSubCategory.splice(idx, 1)
      this.checkedCategory.splice(index, 1)
    }
    console.log(this.checkedCategory, this.checkedSubCategory)
  }

  subCategoryCheckBox(checked: MatCheckbox, subCategory: any[], index: number) {
    console.log(checked)
    if (checked) {
      this.checkedSubCategory.push(subCategory)
    } else if (!checked) {
      this.checkedSubCategory.splice(index, 1)
    }
    console.log(this.checkedSubCategory)
  }

  generateProduct(checked: MatCheckbox, product: any[], index: number) {
    if (checked) {
      this.checkedProduct.push(product)
    } else if (!checked) {
      this.checkedProduct.splice(index, 1)
    }
    console.log(this.checkedProduct)
  }

  selectAll(event: MatCheckbox, type) {
    if (type == 'category') {
    //   this.selectAllArray.forEach(sel => {
    //     sel.valueOf
    //   })
      if (event) {
        this.permissions.forEach(ele => {
          ele.isChecked = true;
          this.checkedCategory.push(ele);
          ele.subCategory.forEach(sub => {
            sub.isChecked = true;
            this.checkedSubCategory.push(ele)
            sub.products.forEach(prod => {
              prod.isChecked = true;
              this.checkedProduct.push(prod.id)
            })
          })
        })
      } else {
        // this.selectAllArray.forEach(sel => {
        //   sel.push(false)
        // })
        this.addIsChecked()
        this.checkedCategory = []
        this.checkedSubCategory = []
        this.checkedProduct = []
      }
    }
  }

}
