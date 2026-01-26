import { TestBed } from '@angular/core/testing';
import { DataTableComponent, TableColumn, TableAction } from './data-table.component';

describe('DataTableComponent', () => {
  let component: DataTableComponent<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DataTableComponent]
    });

    const fixture = TestBed.createComponent(DataTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use OnPush change detection', () => {
    const metadata = (component.constructor as any).ɵcmp;
    expect(metadata.changeDetection).toBe(0); // 0 = OnPush
  });

  it('should track items by configured property', () => {
    component.trackByProperty = 'id';
    const item = { id: 123, name: 'Test' };
    
    const result = component.trackByFn(0, item);
    
    expect(result).toBe(123);
  });

  it('should fall back to index when track property is missing', () => {
    component.trackByProperty = 'id';
    const item = { name: 'Test' }; // No id property
    
    const result = component.trackByFn(5, item);
    
    expect(result).toBe(5);
  });

  describe('getNestedProperty', () => {
    it('should get top-level property', () => {
      const obj = { name: 'John' };
      
      const result = component.getNestedProperty(obj, 'name');
      
      expect(result).toBe('John');
    });

    it('should get nested property', () => {
      const obj = { user: { profile: { name: 'John' } } };
      
      const result = component.getNestedProperty(obj, 'user.profile.name');
      
      expect(result).toBe('John');
    });

    it('should return undefined for missing property', () => {
      const obj = { name: 'John' };
      
      const result = component.getNestedProperty(obj, 'missing.property');
      
      expect(result).toBeUndefined();
    });
  });
});
