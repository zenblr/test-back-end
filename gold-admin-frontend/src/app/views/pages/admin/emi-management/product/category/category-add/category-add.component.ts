import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { SharedService } from '../../../../../../../core/shared/services/shared.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ToastrComponent } from '../../../../../../partials/components/toastr/toastr.component';
import { CategoryService } from '../../../../../../../core/emi-management/product/category/services/category.service';

@Component({
  selector: 'kt-category-add',
  templateUrl: './category-add.component.html',
  styleUrls: ['./category-add.component.scss']
})
export class CategoryAddComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  categoryForm: FormGroup;
  metalType: any;
  viewLoading = false;
  title: string;
  isMandatory = false

  constructor(
    public dialogRef: MatDialogRef<CategoryAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private ref: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    console.log(this.data);
    this.formInitialize();
    this.setForm();
    this.getMetalType();
  }

  formInitialize() {
    this.categoryForm = this.fb.group({
      id: [''],
      categoryName: ['', Validators.required],
      conversionFactor: ['', Validators.required],
      metalTypeId: ['', Validators.required],
    });
  }

  setForm() {
    if (this.data.action === 'add') {
      this.title = 'Add Category';
      this.isMandatory = true;
    } else if (this.data.action === 'edit') {
      this.title = 'Edit Category';
      this.isMandatory = true;
      this.categoryForm.patchValue(this.data.data);
    }
  }

  get controls() {
    return this.categoryForm.controls;
  }

  getMetalType() {
    this.categoryService.getMetalType().subscribe(
      res => {
        console.log(res);
        this.metalType = res;
      }
    )
  }

  getCategoryData(id) {
    this.categoryService.getSingleCategory(id).subscribe(
      res => {
        console.log(res);
        this.categoryForm.patchValue(res[0]);
        this.ref.detectChanges();
      },
      err => {
        console.log(err);
      }
    )
  }

  action(event: Event) {
    if (event) {
      this.onSubmit();
    } else if (!event) {
      this.dialogRef.close();
    }
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    const categoryData = this.categoryForm.value;
    const id = this.controls.id.value;

    if (this.data.action === 'add') {
      this.categoryService.addCategory(categoryData).subscribe(res => {
        if (res) {
          const msg = 'Category Added Sucessfully';
          this.toastr.successToastr(msg);
          this.dialogRef.close(true);
        }
      },
        error => {
          console.log(error.error.message);
          const msg = error.error.message;
          this.toastr.errorToastr(msg);
        });
    } else if (this.data.action === 'edit') {
      this.categoryService.editCategory(id, categoryData).subscribe(res => {
        if (res) {
          const msg = 'Category Updated Sucessfully';
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
}