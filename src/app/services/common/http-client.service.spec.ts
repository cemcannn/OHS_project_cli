import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClientService } from './http-client.service';
import { RequestParameters } from 'src/app/contracts/request-parameters';

describe('HttpClientService', () => {
  let service: HttpClientService;
  let httpMock: HttpTestingController;
  const baseUrl = 'https://localhost:7170/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HttpClientService,
        { provide: 'baseUrl', useValue: baseUrl }
      ]
    });
    service = TestBed.inject(HttpClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Tüm HTTP isteklerinin tamamlandığını doğrula
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('GET requests', () => {
    it('should make GET request with correct URL', () => {
      const requestParams: Partial<RequestParameters> = {
        controller: 'accidents',
        action: 'getall'
      };
      const mockResponse = { data: [] };

      service.get(requestParams).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/accidents/getall`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should append ID to URL when provided', () => {
      const requestParams: Partial<RequestParameters> = {
        controller: 'accidents'
      };
      const id = '123';

      service.get(requestParams, id).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/accidents/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should append query string when provided', () => {
      const requestParams: Partial<RequestParameters> = {
        controller: 'accidents',
        queryString: 'page=1&size=10'
      };

      service.get(requestParams).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/accidents?page=1&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should use fullEndPoint when provided', () => {
      const fullUrl = 'https://api.example.com/custom/endpoint';
      const requestParams: Partial<RequestParameters> = {
        fullEndPoint: fullUrl,
        controller: 'accidents' // Should be ignored
      };

      service.get(requestParams).subscribe();

      const req = httpMock.expectOne(fullUrl);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('POST requests', () => {
    it('should make POST request with correct URL and body', () => {
      const requestParams: Partial<RequestParameters> = {
        controller: 'accidents',
        action: 'create'
      };
      const body = { name: 'Test Accident' };
      const mockResponse = { id: '1', name: 'Test Accident' };

      service.post(requestParams, body).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/accidents/create`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush(mockResponse);
    });

    it('should append query string to POST request', () => {
      const requestParams: Partial<RequestParameters> = {
        controller: 'accidents',
        queryString: 'directorate=1'
      };
      const body = { name: 'Test' };

      service.post(requestParams, body).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/accidents?directorate=1`);
      expect(req.request.method).toBe('POST');
      req.flush({});
    });
  });

  describe('PUT requests', () => {
    it('should make PUT request with correct URL and body', () => {
      const requestParams: Partial<RequestParameters> = {
        controller: 'accidents',
        action: 'update'
      };
      const body = { id: '1', name: 'Updated Accident' };

      service.put(requestParams, body).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/accidents/update`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      req.flush({});
    });
  });

  describe('DELETE requests', () => {
    it('should make DELETE request with ID', () => {
      const requestParams: Partial<RequestParameters> = {
        controller: 'accidents'
      };
      const id = '123';

      service.delete(requestParams, id).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/accidents/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('should use fullEndPoint for DELETE', () => {
      const fullUrl = 'https://api.example.com/delete/123';
      const requestParams: Partial<RequestParameters> = {
        fullEndPoint: fullUrl
      };

      service.delete(requestParams, '123').subscribe();

      const req = httpMock.expectOne(fullUrl);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});
