import { TestBed } from '@angular/core/testing';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { PwaService } from './pwa.service';
import { Subject } from 'rxjs';

describe('PwaService', () => {
  let service: PwaService;
  let swUpdateSpy: jasmine.SpyObj<SwUpdate>;
  let versionUpdatesSubject: Subject<any>;

  beforeEach(() => {
    versionUpdatesSubject = new Subject();
    
    const swSpy = jasmine.createSpyObj('SwUpdate', ['checkForUpdate', 'activateUpdate'], {
      isEnabled: true,
      versionUpdates: versionUpdatesSubject.asObservable()
    });

    TestBed.configureTestingModule({
      providers: [
        PwaService,
        { provide: SwUpdate, useValue: swSpy }
      ]
    });

    swUpdateSpy = TestBed.inject(SwUpdate) as jasmine.SpyObj<SwUpdate>;
  });

  it('should be created', () => {
    service = TestBed.inject(PwaService);
    expect(service).toBeTruthy();
  });

  it('should not check for updates when SW is disabled', () => {
    (swUpdateSpy as any).isEnabled = false;
    spyOn(console, 'log');

    service = TestBed.inject(PwaService);

    expect(console.log).toHaveBeenCalledWith('Service Worker is not enabled');
  });

  it('should prompt and reload on version ready when user confirms', (done) => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(document.location, 'reload');
    swUpdateSpy.activateUpdate.and.returnValue(Promise.resolve(true));

    service = TestBed.inject(PwaService);

    const versionEvent: VersionReadyEvent = {
      type: 'VERSION_READY',
      currentVersion: { hash: 'old' } as any,
      latestVersion: { hash: 'new' } as any
    };

    versionUpdatesSubject.next(versionEvent);

    setTimeout(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(swUpdateSpy.activateUpdate).toHaveBeenCalled();
      expect(document.location.reload).toHaveBeenCalled();
      done();
    }, 100);
  });
});
