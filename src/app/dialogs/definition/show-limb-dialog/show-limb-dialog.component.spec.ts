import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowLimbDialogComponent } from './show-limb-dialog.component';

describe('ShowLimbDialogComponent', () => {
  let component: ShowLimbDialogComponent;
  let fixture: ComponentFixture<ShowLimbDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShowLimbDialogComponent]
    });
    fixture = TestBed.createComponent(ShowLimbDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
