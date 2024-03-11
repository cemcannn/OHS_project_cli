import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntranceComponent } from './entrance.component';

describe('EntranceComponent', () => {
  let component: EntranceComponent;
  let fixture: ComponentFixture<EntranceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EntranceComponent]
    });
    fixture = TestBed.createComponent(EntranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
