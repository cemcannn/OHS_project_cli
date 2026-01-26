import { TestBed } from '@angular/core/testing';
import { StateService, User, Accident } from './state.service';

describe('StateService', () => {
  let service: StateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StateService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('user management', () => {
    it('should set user', () => {
      const user: User = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        roles: ['User']
      };

      service.setUser(user);

      expect(service.currentUser()).toEqual(user);
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should update user', () => {
      const user: User = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        roles: ['User']
      };

      service.setUser(user);
      service.updateUser({ name: 'Jane Doe' });

      expect(service.currentUser()?.name).toBe('Jane Doe');
      expect(service.currentUser()?.email).toBe('john@example.com');
    });

    it('should logout user', () => {
      const user: User = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        roles: ['User']
      };

      service.setUser(user);
      service.logout();

      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('computed signals', () => {
    it('should compute isAdmin correctly', () => {
      const adminUser: User = {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        roles: ['Admin', 'User']
      };

      service.setUser(adminUser);

      expect(service.isAdmin()).toBeTrue();
    });

    it('should compute accidentCount correctly', () => {
      const accidents: Accident[] = [
        {
          id: '1',
          personnelId: '123',
          accidentDate: new Date(),
          description: 'Test 1'
        },
        {
          id: '2',
          personnelId: '124',
          accidentDate: new Date(),
          description: 'Test 2'
        }
      ];

      service.setAccidents(accidents);

      expect(service.accidentCount()).toBe(2);
    });
  });

  describe('accident management', () => {
    it('should add accident', () => {
      const accident: Accident = {
        id: '1',
        personnelId: '123',
        accidentDate: new Date(),
        description: 'Test accident'
      };

      service.addAccident(accident);

      expect(service.allAccidents().length).toBe(1);
      expect(service.allAccidents()[0]).toEqual(accident);
    });

    it('should update accident', () => {
      const accident: Accident = {
        id: '1',
        personnelId: '123',
        accidentDate: new Date(),
        description: 'Test accident'
      };

      service.addAccident(accident);
      service.updateAccident('1', { description: 'Updated description' });

      expect(service.allAccidents()[0].description).toBe('Updated description');
    });

    it('should remove accident', () => {
      const accident: Accident = {
        id: '1',
        personnelId: '123',
        accidentDate: new Date(),
        description: 'Test accident'
      };

      service.addAccident(accident);
      service.removeAccident('1');

      expect(service.allAccidents().length).toBe(0);
    });
  });

  describe('theme management', () => {
    it('should toggle theme', () => {
      const initialTheme = service.currentTheme();
      service.toggleTheme();
      const newTheme = service.currentTheme();

      expect(newTheme).not.toBe(initialTheme);
    });

    it('should set theme', () => {
      service.setTheme('dark');

      expect(service.currentTheme()).toBe('dark');
    });
  });
});
