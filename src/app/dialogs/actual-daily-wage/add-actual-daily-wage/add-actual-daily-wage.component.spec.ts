import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddActualDailyWageComponent } from './add-actual-daily-wage.component';

describe('AddActualDailyWageComponent', () => {
  let component: AddActualDailyWageComponent;
  let fixture: ComponentFixture<AddActualDailyWageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddActualDailyWageComponent]
    });
    fixture = TestBed.createComponent(AddActualDailyWageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
