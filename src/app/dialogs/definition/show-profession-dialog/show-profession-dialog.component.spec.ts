import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowProfessionDialogComponent } from './show-profession-dialog.component';

describe('ShowProfessionDialogComponent', () => {
  let component: ShowProfessionDialogComponent;
  let fixture: ComponentFixture<ShowProfessionDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShowProfessionDialogComponent]
    });
    fixture = TestBed.createComponent(ShowProfessionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
