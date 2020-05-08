import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ToastrComponent } from '../../../../../../views/partials/components/toastr/toastr.component';
import { ProductService } from '../../../../../../core/emi-management/product/product-list/services/product.service';
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
  editData = false;
  viewOnly = false;
  viewLoading = false;
  title: string;
  isMandatory = false

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
      productImage: ['', Validators.required],
      manufacturingCostPerGram: ['', Validators.required],
      hallmarkingPackaging: ['', Validators.required],
      shipping: ['', Validators.required],
      // productImages: ['', Validators.required],
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
    this.subCategoryService.getSubCategory().subscribe(res => {
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
    const productData = this.productForm.value;
    const id = this.controls.id.value;

    if (this.data.action == 'edit') {
      this.productService.editProduct(id, productData).subscribe(res => {
        if (res) {
          const msg = 'Product Updated Sucessfully';
          this.toastr.successToastr(msg);
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

  onAlertClose($event) {
    // this.hasFormErrors = false;
  }
}
