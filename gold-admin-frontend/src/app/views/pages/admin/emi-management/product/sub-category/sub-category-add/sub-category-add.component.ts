import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { SharedService } from '../../../../../../../core/shared/services/shared.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ToastrComponent } from '../../../../../../partials/components/toastr/toastr.component';
import { SubCategoryService } from '../../../../../../../core/emi-management/product/sub-category/services/sub-category.service';

@Component({
  selector: 'kt-sub-category-add',
  templateUrl: './sub-category-add.component.html',
  styleUrls: ['./sub-category-add.component.scss']
})
export class SubCategoryAddComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  subCategoryForm: FormGroup;
  category: any;
  viewLoading = false;
  title: string;
  isMandatory = false

  constructor(
    public dialogRef: MatDialogRef<SubCategoryAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private subCategoryService: SubCategoryService,
    private ref: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    console.log(this.data);
    this.formInitialize();
    this.setForm();
    this.getCategory();
  }

  formInitialize() {
    this.subCategoryForm = this.fb.group({
      id: [''],
      categoryId: ['', Validators.required],
      subCategoryName: ['', Validators.required],
    });
  }

  setForm() {
    if (this.data.action === 'add') {
      this.title = 'Add Sub-Category';
      this.isMandatory = true;
    } else if (this.data.action === 'edit') {
      this.title = 'Edit Sub-Category';
      this.isMandatory = true;
      this.subCategoryForm.patchValue(this.data.data);
    }
  }

  get controls() {
    return this.subCategoryForm.controls;
  }

  getCategory() {
    this.subCategoryService.getAllCategory().subscribe(
      res => {
        console.log(res);
        this.category = res;
      }
    )
  }

  getSubCategoryData(id) {
    this.subCategoryService.getSingleSubCategory(id).subscribe(
      res => {
        console.log(res);
        this.subCategoryForm.patchValue(res[0]);
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
    if (this.subCategoryForm.invalid) {
      this.subCategoryForm.markAllAsTouched();
      return;
    }
    const categoryData = this.subCategoryForm.value;
    const id = this.controls.id.value;

    if (this.data.action === 'add') {
      this.subCategoryService.addSubCategory(categoryData).subscribe(res => {
        if (res) {
          const msg = 'Sub-Category Added Sucessfully';
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
      this.subCategoryService.editSubCategory(id, categoryData).subscribe(res => {
        if (res) {
          const msg = 'Sub-Category Updated Sucessfully';
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