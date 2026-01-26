import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';
import { of, delay } from 'rxjs';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show loading for a key', (done) => {
    service.show('test');
    
    service.isLoading('test').subscribe(isLoading => {
      expect(isLoading).toBeTrue();
      done();
    });
  });

  it('should hide loading for a key', (done) => {
    service.show('test');
    service.hide('test');
    
    service.isLoading('test').subscribe(isLoading => {
      expect(isLoading).toBeFalse();
      done();
    });
  });

  it('should handle multiple loading keys independently', (done) => {
    service.show('key1');
    service.show('key2');
    service.hide('key1');
    
    service.loading$.subscribe(state => {
      expect(state['key1']).toBeFalse();
      expect(state['key2']).toBeTrue();
      done();
    });
  });

  it('should wrap observable with loading state', (done) => {
    const mockObservable = of('test data').pipe(delay(100));
    
    let loadingShown = false;
    let loadingHidden = false;

    service.isLoading('wrap-test').subscribe(isLoading => {
      if (isLoading) loadingShown = true;
      if (!isLoading && loadingShown) loadingHidden = true;
    });

    service.wrapObservable(mockObservable, 'wrap-test').subscribe(data => {
      expect(data).toBe('test data');
      
      setTimeout(() => {
        expect(loadingShown).toBeTrue();
        expect(loadingHidden).toBeTrue();
        done();
      }, 150);
    });
  });
});
