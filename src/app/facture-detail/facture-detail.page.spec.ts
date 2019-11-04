import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FactureDetailPage } from './facture-detail.page';

describe('FactureDetailPage', () => {
  let component: FactureDetailPage;
  let fixture: ComponentFixture<FactureDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FactureDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactureDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
