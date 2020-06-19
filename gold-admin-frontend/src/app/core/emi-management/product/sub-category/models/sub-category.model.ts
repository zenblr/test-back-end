export class SubCategoryModel {
    categoryName: string;
    categoryId: number;
    subCategoryName: string;
    subCategoryId: string;

    clear() {
        this.categoryName = null;
        this.categoryId = null;
        this.subCategoryName = null;
        this.subCategoryId = null;
    }
}