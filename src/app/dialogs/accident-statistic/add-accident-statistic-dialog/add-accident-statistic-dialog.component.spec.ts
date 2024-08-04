import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAccidentStatisticDialogComponent } from './add-accident-statistic-dialog.component';

describe('AddAccidentStatisticDialogComponent', () => {
  let component: AddAccidentStatisticDialogComponent;
  let fixture: ComponentFixture<AddAccidentStatisticDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddAccidentStatisticDialogComponent]
    });
    fixture = TestBed.createComponent(AddAccidentStatisticDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
