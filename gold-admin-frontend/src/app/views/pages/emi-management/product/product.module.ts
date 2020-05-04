import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductComponent } from './product.component';
import { ShowProductsComponent } from './show-products/show-products.component';
import { CategoryComponent } from './category/category.component';
import { SubCategoryComponent } from './sub-category/sub-category.component';
import { UploadProductComponent } from './upload-product/upload-product.component';
import { UploadDesignComponent } from './upload-design/upload-design.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: ProductComponent,
    children: [
      {
        path: '',
        component: ShowProductsComponent
      },
      {
        path: 'category',
        component: CategoryComponent
      },
      {
        path: 'sub-category',
        component: SubCategoryComponent
      },
      {
        path: 'upload-product',
        component: UploadProductComponent
      },
      {
        path: 'upload-design',
        component: UploadDesignComponent
      },
    ]
  }
];

@NgModule({
  declarations: [
    ProductComponent,
    ShowProductsComponent,
    CategoryComponent,
    SubCategoryComponent,
    UploadProductComponent,
    UploadDesignComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ]
})
export class ProductModule { }
