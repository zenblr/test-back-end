export class ProductModel {
    productImage:any ;
    sku:any;
    productName:string ;
    categoryName:string;
    subCategoryName:string;
    weight:number;
    price:number;
    manufacturingCostPerGram:number;
    shipping:number;
    
    
   
clear() {
    this.productImage=null;
    this.sku=null;
    this.productName=null;
    this.categoryName=null;
    this.subCategoryName=null;
    this.weight=null;
    this.price=null;
    this.manufacturingCostPerGram=null;
    this.shipping=null;    
}
}