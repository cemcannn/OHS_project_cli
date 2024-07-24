import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowAccidentAreaDialogComponent } from './show-accident-area-dialog.component';

describe('ShowAccidentAreaDialogComponent', () => {
  let component: ShowAccidentAreaDialogComponent;
  let fixture: ComponentFixture<ShowAccidentAreaDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShowAccidentAreaDialogComponent]
    });
    fixture = TestBed.createComponent(ShowAccidentAreaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
