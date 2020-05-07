import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpUtilsService } from '../../../../core/_base/crud';

@Injectable({
  providedIn: 'root'
})
export class UploadDesignService {

  openModal = new BehaviorSubject<any>(false);
  openModal$ = this.openModal.asObservable();

  constructor(private http: HttpClient, private _router: Router,
    private httpUtils: HttpUtilsService) { }

  getWalletPrice(): Observable<any> {
    return this.http
      .get<any>(`http://173.249.49.7:9120/api/wallet`, { observe: 'response' })
      .pipe(map(response => response.body));
  }

  addWalletPrice(data): Observable<any> {
    return this.http.post<any>(`http://173.249.49.7:9120/api/wallet`, data);
  }

  updateWalletPrice(id, data): Observable<any> {
    return this.http.put<any>(`http://173.249.49.7:9120/api/wallet/${id}`, data);
  }

  public getAllPosition(from: number, to: number, search: string): Observable<any> {
    return this.http.get<any>(`/api/product?from=${from}&to=${to}&search=${search}`).pipe(

      (tap(allMemberData => {
        return allMemberData
      })),
      (catchError(error => {
        throw error;
      }))
    )
  }
  public uploadexcel(fd) {
    return this.http.post<any>(`/api/file-upload`, fd);
  }
  public uploadMultipleImages(fd) {
    return this.http.post<any>(`/api/file-upload/multiple-images`, fd);
  }

  public uploadexcel2(fd) {
    return this.http.post<any>(`/api/bulk-upload`, fd);
  }

  public uploadexcelnext(path, fileExtension) {
    return this.http.post<any>(`/api/product/from-excel`, { path, fileExtension });
  }

  public uploadexcelnextBulkUpload(path, fileId, fileExtension) {
    return this.http.post<any>(`/api/product/from-excel`, { path, fileId, fileExtension });
  }

  public uploadSingleProduct(categoryId, subCategoryId, productCode, stoneWeight, fancyStoneWeight, weight, totalWeight, productImage1, productImage2, productImage3, visibleToGuest): Observable<any> {
    return this.http.post<any>(`api/product`, { categoryId, subCategoryId, productCode, stoneWeight, fancyStoneWeight, weight, totalWeight, productImage1, productImage2, productImage3, visibleToGuest });
  }

  public deleteProduct(id) {
    return this.http.delete<any>(`/api/product/` + id);
  }

  public uploadBanners(images) {
    return this.http.post<any>(`/api/banner`, { images });
  }

  public getBanners() {
    return this.http.get<any>(`/api/banner/`)
  }

  public getSingleProduct(id) {
    return this.http.get<any>(`/api/product/` + id);
  }

  public editProduct(id, categoryId, subCategoryId, productCode, stoneWeight, fancyStoneWeight, weight, totalWeight, productImage1, productImage2, productImage3) {
    let data = {
      'categoryId': categoryId,
      'subCategoryId': subCategoryId,
      'productCode': productCode,
      'totalWeight': totalWeight,
      'stoneWeight': stoneWeight,
      'fancyStoneWeight': fancyStoneWeight,
      'weight': weight,
      'productImage1': productImage1,
      'productImage2': productImage2,
      'productImage3': productImage3,
    };
    return this.http.put<any>(`/api/product/` + id, data);
  }

  public visibleToGuests(id, event) {
    let data = {
      visibleToGuest: event
    };
    return this.http.put<any>(`/api/product/toggle-product-status/` + id, data);
  }

  public popularity(id) {
    return this.http.get<any>('/api/product/popularity-check/' + id);
  }
}
