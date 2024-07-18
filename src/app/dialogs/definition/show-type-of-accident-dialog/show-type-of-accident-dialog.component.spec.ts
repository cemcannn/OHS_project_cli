import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowTypeOfAccidentDialogComponent } from './show-type-of-accident-dialog.component';

describe('ShowTypeOfAccidentDialogComponent', () => {
  let component: ShowTypeOfAccidentDialogComponent;
  let fixture: ComponentFixture<ShowTypeOfAccidentDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShowTypeOfAccidentDialogComponent]
    });
    fixture = TestBed.createComponent(ShowTypeOfAccidentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
