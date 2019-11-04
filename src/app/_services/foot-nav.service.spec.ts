import { TestBed } from '@angular/core/testing';

import { FootNavService } from './foot-nav.service';

describe('FootNavService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FootNavService = TestBed.get(FootNavService);
    expect(service).toBeTruthy();
  });
});
