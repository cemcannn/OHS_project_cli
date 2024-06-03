import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowDefinitionDialogComponent } from './show-definition-dialog.component';

describe('ShowDefinitionDialogComponent', () => {
  let component: ShowDefinitionDialogComponent;
  let fixture: ComponentFixture<ShowDefinitionDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShowDefinitionDialogComponent]
    });
    fixture = TestBed.createComponent(ShowDefinitionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
