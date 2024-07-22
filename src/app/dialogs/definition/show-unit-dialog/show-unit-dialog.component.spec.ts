import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowUnitDialogComponent } from './show-unit-dialog.component';

describe('ShowUnitDialogComponent', () => {
  let component: ShowUnitDialogComponent;
  let fixture: ComponentFixture<ShowUnitDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShowUnitDialogComponent]
    });
    fixture = TestBed.createComponent(ShowUnitDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
