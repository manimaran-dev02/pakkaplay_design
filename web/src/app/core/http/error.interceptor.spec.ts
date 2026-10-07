import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ApiError, NETWORK_ERROR } from './api-error';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  async function failWith(flush: (req: ReturnType<HttpTestingController['expectOne']>) => void) {
    const result = firstValueFrom(http.get('/api/v1/players/1')).catch((e: ApiError) => e);
    flush(backend.expectOne('/api/v1/players/1'));
    return (await result) as ApiError;
  }

  it('passes through the backend ApiError body', async () => {
    const body: ApiError = {
      timestamp: '2026-01-01T00:00:00Z',
      status: 404,
      code: 'NOT_FOUND',
      message: "Player '1' was not found.",
      path: '/api/v1/players/1',
    };

    const error = await failWith((req) =>
      req.flush(body, { status: 404, statusText: 'Not Found' }),
    );

    expect(error).toEqual(body);
  });

  it('maps a network failure to NETWORK_ERROR', async () => {
    const error = await failWith((req) => req.error(new ProgressEvent('error')));

    expect(error.code).toBe(NETWORK_ERROR);
    expect(error.status).toBe(0);
  });

  it('maps a non-ApiError body to UNKNOWN_ERROR', async () => {
    const error = await failWith((req) =>
      req.flush('<html>Bad gateway</html>', { status: 502, statusText: 'Bad Gateway' }),
    );

    expect(error.code).toBe('UNKNOWN_ERROR');
    expect(error.status).toBe(502);
  });
});
