export class RolesModel {
    id: number;
    roleName: string;
    createdBy: string
    modifiedBy: string;
    modifiedDate: string;
    modifiedTime: string;
    action: string;

    clear() {
        this.id = null;
        this.roleName = '';
        this.createdBy = ''
        this.modifiedBy = '';
        this.modifiedDate = '';
        this.modifiedTime = '';
        this.action = '';
    }
}