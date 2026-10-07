import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DashboardPage } from './dashboard-page';

describe('DashboardPage', () => {
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
  });

  async function render(respond: (req: ReturnType<HttpTestingController['expectOne']>) => void) {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    const status = () =>
      (fixture.nativeElement as HTMLElement).querySelector('[data-testid="backend-status"]')!;
    expect(status().textContent).toContain('checking');

    respond(backend.expectOne('/actuator/health'));
    await fixture.whenStable();
    return status().textContent;
  }

  it('shows online when the backend is healthy', async () => {
    expect(await render((req) => req.flush({ status: 'UP' }))).toContain('online');
  });

  it('shows unreachable when the health check fails', async () => {
    expect(await render((req) => req.error(new ProgressEvent('error')))).toContain('unreachable');
  });
});
