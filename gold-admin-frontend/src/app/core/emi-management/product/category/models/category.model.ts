export class CategoryModel {
    categoryName: string;
    categoryId: number;
    converSionFactor: number;

    clear() {
        this.categoryName = null;
        this.categoryId = null;
        this.converSionFactor = null;
    }
}