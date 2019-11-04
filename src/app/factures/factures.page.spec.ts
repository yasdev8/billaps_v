import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturesPage } from './factures.page';

describe('FacturesPage', () => {
  let component: FacturesPage;
  let fixture: ComponentFixture<FacturesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FacturesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacturesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
