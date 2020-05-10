import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { SubCategoryService } from '../../../../../../core/emi-management/product/sub-category/services/sub-category.service';

@Component({
  selector: 'kt-sub-category-add',
  templateUrl: './sub-category-add.component.html',
  styleUrls: ['./sub-category-add.component.scss']
})
export class SubCategoryAddComponent implements OnInit {
  title: string;
  addEditSubCategory: FormGroup;
  isMandatory: boolean = false;
  categoryList: any;

  constructor(
    public dialogRef: MatDialogRef<SubCategoryAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public fb: FormBuilder,
    public SubCategoryService: SubCategoryService,
    public toast: ToastrService, public ref: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    console.log(this.data);
    this.formdata();
    this.setForm();
    this.getCategoryList();
  }
  formdata() {
    this.addEditSubCategory = this.fb.group({
      categoryId: ['', Validators.required],
      subCategoryName: ['', Validators.required],

    });
  }
  setForm() {
    if (this.data.action === 'add') {
      this.title = 'Add New Sub Category';
      this.isMandatory = true;

    } else if (this.data.action === 'edit') {
      this.title = 'Edit Sub Category';
      this.isMandatory = true;
      this.getSubCategoryData(this.data.subCategoryId);
    }
  }

  action(event: Event) {
    if (event) {
      this.onSubmit();
    } else if (!event) {
      this.dialogRef.close();
    }
  }

  onSubmit() {
    const subCategoryData = this.addEditSubCategory.value;
    if (this.data.action === 'add') {

      this.SubCategoryService.addNewSubCategory(subCategoryData).subscribe(
        res => {
          this.toast.success("Success", "Sub Category Added Successfully", {
            timeOut: 3000
          });
          this.dialogRef.close();
        },
        err => {
          this.toast.error('Sorry', err['error']['message'], {
            timeOut: 3000
          });
          this.dialogRef.close();
        }
      )
    } else if (this.data.action === 'edit') {
      this.SubCategoryService.editSubCategory(subCategoryData, this.data.subCategoryId).subscribe(
        res => {
          this.toast.success("Success", "Sub Category Updated Successfully", {
            timeOut: 3000
          });
          this.dialogRef.close();
        },
        err => {
          this.toast.error('Sorry', err['error']['message'], {
            timeOut: 3000
          });
          this.dialogRef.close();
        }
      )
    }
  }


  getCategoryList() {
    this.SubCategoryService.getCategoryList().subscribe(
      res => {
        console.log(res);
        this.categoryList = res;
      }
    )
  }

  get controls() {
    return this.addEditSubCategory.controls;
  }

  getSubCategoryData(id) {
    this.SubCategoryService.getSingleSubCategory(id).subscribe(
      res => {
        console.log(res);
        this.addEditSubCategory.patchValue(res[0]);
        this.ref.detectChanges();
      },
      err => {
        console.log(err);
      }
    )
  }
}