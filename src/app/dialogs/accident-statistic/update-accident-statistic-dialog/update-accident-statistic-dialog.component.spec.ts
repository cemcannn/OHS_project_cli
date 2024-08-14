import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateAccidentStatisticDialogComponent } from './update-accident-statistic-dialog.component';

describe('UpdateAccidentStatisticDialogComponent', () => {
  let component: UpdateAccidentStatisticDialogComponent;
  let fixture: ComponentFixture<UpdateAccidentStatisticDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateAccidentStatisticDialogComponent]
    });
    fixture = TestBed.createComponent(UpdateAccidentStatisticDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
