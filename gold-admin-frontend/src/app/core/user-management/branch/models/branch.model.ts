export class BranchModel {
    commission: number;
    createdAt: string;
    id: number;
    isActive = false;
    name: string;
    partnerId: string;
    updatedAt: string;

    clear() {
        this.commission = null;
        this.createdAt = '';
        this.id = null;
        this.isActive = true
        this.name = '';
        this.partnerId = '';
        this.updatedAt = '';
    }
}