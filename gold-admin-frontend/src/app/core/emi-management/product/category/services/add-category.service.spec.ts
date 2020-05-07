import { TestBed } from '@angular/core/testing';

import { AddCategoryService } from './add-category.service';

describe('AddCategoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AddCategoryService = TestBed.get(AddCategoryService);
    expect(service).toBeTruthy();
  });
});
