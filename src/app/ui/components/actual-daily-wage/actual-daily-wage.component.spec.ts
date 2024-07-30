import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualDailyWageComponent } from './actual-daily-wage.component';

describe('ActualDailyWageComponent', () => {
  let component: ActualDailyWageComponent;
  let fixture: ComponentFixture<ActualDailyWageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ActualDailyWageComponent]
    });
    fixture = TestBed.createComponent(ActualDailyWageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
