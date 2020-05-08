import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import {AddCategoryService} from '../../../../../../core/emi-management/product/category/services/add-category.service';


type NewType = FormGroup;

@Component({
  selector: 'kt-add-edit-category',
  templateUrl: './add-edit-category.component.html',
  styleUrls: ['./add-edit-category.component.scss']
})
export class AddEditCategoryComponent implements OnInit {


    title: string;
    addCategory: FormGroup;
    isMandatory: boolean = false;
    metalListType:any;

    constructor(
      public dialogRef: MatDialogRef<AddEditCategoryComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any, public fb: FormBuilder,
      public addCategoryService: AddCategoryService,
      public toast: ToastrService , public ref: ChangeDetectorRef ,
    ) { }

  ngOnInit() {
    console.log(this.data);
    this.formdata();
    this.setForm();
    this.getMetalTypeList();
  }
  formdata() {
    this.addCategory = this.fb.group({
		categoryName: ['', Validators.required],
    conversionFactor: ['', Validators.required],
    metalTypeId : ['', Validators.required],
    });
  }
  setForm() {
    if (this.data.action === 'add') {
      this.title = 'Add New Category';
	  this.isMandatory = true ;

    } else if(this.data.action === 'edit') {
      this.title = 'Edit Category';
      this.isMandatory = true;
      this.getCategoryData(this.data.categoryId);
    }
  }

  action(event: Event) {
    if (event) {
      this.onSubmit();
    } else if (!event) {
      this.dialogRef.close();
    }
  }

  onSubmit(){
		const categoryData = this.addCategory.value;
	  if (this.data.action === 'add') {

		this.addCategoryService.addNewCategory(categoryData).subscribe(
			res=>{
				this.toast.success("Success", "Category Added Successfully", {
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
	} else if (this.data.action === 'edit'){
		this.addCategoryService.editCategory(categoryData , this.data.categoryId).subscribe(
			res=>{
				this.toast.success("Success", "Category Updated Successfully", {
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
  }


  getMetalTypeList(){
    this.addCategoryService.getMetalList().subscribe(
      res=>{
        console.log(res);
        this.metalListType = res ;
      }
    )
  }



  get controls() {
    return this.addCategory.controls;
  }
  getCategoryData(id){
		this.addCategoryService.getSingleCategory(id).subscribe(
		  res=>{
			  console.log(res);
			//   console.log(res[0]['categoryName']);
			//   this.addCategory.setValue({categoryName : res['categoryName']});
			this.addCategory.patchValue(res[0]);
			  this.ref.detectChanges();
		  },
		  err =>{
			  console.log(err);
		  }
	  )
  }
}

