import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ToastrComponent } from '../../../../../../views/partials/components/toastr/toastr.component';
import { ProductService } from '../../../../../../core/emi-management/product/show-product/services/product.service';
import { SubCategoryService } from '../../../../../../core/emi-management/product/sub-category/services/sub-category.service';

@Component({
  selector: 'kt-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss']
})
export class ProductEditComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  productForm: FormGroup;
  subcategories: any;
  productData: any;
  viewLoading = false;
  title: string;
  isMandatory = false;
  removeImagesArr = [];

  constructor(
    public dialogRef: MatDialogRef<ProductEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private productService: ProductService,
    private subCategoryService: SubCategoryService,
    private ref: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    console.log(this.data);
    this.formInitialize();
    this.setForm();
  }

  formInitialize() {
    this.productForm = this.fb.group({
      id: [''],
      subCategoryId: ['', Validators.required],
      sku: [''],
      productName: ['', Validators.required],
      weight: ['', Validators.required],
      price: [],
      productImage: [''],
      manufacturingCostPerGram: ['', Validators.required],
      hallmarkingPackaging: ['', Validators.required],
      shipping: ['', Validators.required],
      productImages: [''],
    });
  }

  setForm() {
    if (this.data.action == 'edit') {
      this.title = 'Edit Product'
      this.isMandatory = true
      this.getSingleProductData(this.data.productId);
      this.getSubCategory();
    } else {
      this.title = 'View Product'
      this.productForm.disable();
      this.getSingleProductData(this.data.productId);
    }
  }

  get controls() {
    return this.productForm.controls;
  }

  getSubCategory() {
    this.subCategoryService.getAllSubCategory().subscribe(res => {
      this.subcategories = res.data;
      this.ref.detectChanges();
    },
      error => {
      });
  }

  action(event: Event) {
    if (event) {
      this.onSubmit()
    } else if (!event) {
      this.dialogRef.close()
    }
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched()
      return;
    }
    const _productData = this.productForm.value;
    const id = this.controls.id.value;

    delete _productData.id;
    delete _productData.sku;
    delete _productData.price;

    if (this.data.action == 'edit') {
      this.productService.editProduct(id, _productData).subscribe(res => {
        if (res) {
          const msg = 'Product Updated Sucessfully';
          this.toastr.successToastr(msg);
          if (this.removeImagesArr.length) {
            for (const img of this.removeImagesArr) {
              this.productService.deleteProductImage(img.id).subscribe();
            }
          }
          this.dialogRef.close(true);
        }
      },
        error => {
          console.log(error.error.message);
          const msg = error.error.message;
          this.toastr.errorToastr(msg);
        });
    }
  }

  getSingleProductData(id) {
    this.viewLoading = true
    this.productService.getSingleProduct(id).subscribe(
      res => {
        console.log(res);
        if (this.data.action == 'view') {
          if (res.productImage != '0') {
            const prodImage = {
              url: res.productImage
            }
            res.productImages.push(prodImage);
          }
        }
        this.productData = res;
        this.productForm.patchValue(res);
        this.productForm.controls['price'].patchValue(res.productPrice[0].finalProductPrice);
        this.ref.detectChanges();
      },
      err => {
        console.log(err);
      }
    )
  }

  uploadImage(data) {
    if (data.listView) {
      for (let i = 0; i < this.productData.productImages.length; i++) {
        const product = this.productData.productImages[i];
        if (i == data.index) {
          product.url = data.uploadData.URL;
          this.productForm.controls['productImages'].patchValue(this.productData.productImages);
        }
      }
    } else {
      this.productForm.controls['productImage'].patchValue(data.URL);
    }
  }

  removeImage(index) {
    for (let i = 0; i < this.productData.productImages.length; i++) {
      const product = this.productData.productImages[i];
      if (i == index) {
        this.removeImagesArr.push(product);
        this.productData.productImages.splice(index, 1);
        this.productForm.controls['productImages'].patchValue(this.productData.productImages);
      }
    }
  }

  onAlertClose($event) {
    // this.hasFormErrors = false;
  }
}
