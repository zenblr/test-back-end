import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import {AddCategoryService} from '../../../../../../core/emi-management/product/services/add-category.service';

@Component({
  selector: 'kt-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss']
})
export class ProductEditComponent implements OnInit {


  title: string;
  editProduct: FormGroup;
  isMandatory: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ProductEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public fb: FormBuilder,
    public addCategoryService: AddCategoryService,
    public toast: ToastrService , public ref: ChangeDetectorRef ,
  ) { }

ngOnInit() {
  console.log(this.data);
  this.formdata();
  this.setForm();

}
formdata() {
  this.editProduct = this.fb.group({
    subCategoryName :['',Validators.required],
    // sku :['', Validators.required],
    productName : ['',Validators.required],
    weight: ['',Validators.required],
    productImage : ['' , Validators.required],
    manufacturingCostPerGram : ['', Validators.required],
    hallmarkingPackaging : ['',Validators.required],
    shipping : ['', Validators.required],
    productImages : ['',Validators.required],

  });
}
setForm() {
    this.title = 'Edit Category';
    this.isMandatory = true;
    this.getSingleProductData(this.data.productId);  
}

action(event: Event) {
  if (event) {
    this.onSubmit();
  } else if (!event) {
    this.dialogRef.close();
  }
}

onSubmit(){
  const productData = this.editProduct.value;
 

  this.addCategoryService.editProduct(productData , this.data.categoryId).subscribe(
    res=>{
      this.toast.success("Success", "Product Updated Successfully", {
        timeOut: 3000
        });
      this.dialogRef.close();
    },
    err=>{
      this.toast.error('Sorry', err['error']['message'], {
        timeOut: 3000
      });
      this.dialogRef.close();
    }
  )

}





get controls() {
  return this.editProduct.controls;
}
getSingleProductData(id){
  this.addCategoryService.getSingleProduct(id).subscribe(
    res=>{
      console.log(res);
    //   console.log(res[0]['categoryName']);
    //   this.addCategory.setValue({categoryName : res['categoryName']});
    this.editProduct.patchValue(res[0]);
      this.ref.detectChanges();
    },
    err =>{
      console.log(err);
    }
  )
}

}
