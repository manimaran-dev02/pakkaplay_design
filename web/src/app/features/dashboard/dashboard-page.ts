import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SystemStatusService } from '../../core/system/system-status.service';

/** Phase 1 landing page: confirms the web app can reach the backend. */
@Component({
  selector: 'pp-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="dashboard">
      <h1>Pakka Play</h1>
      <p class="status" data-testid="backend-status">
        Backend:
        @switch (status()) {
          @case ('UP') {
            <strong class="up">online</strong>
          }
          @case ('DOWN') {
            <strong class="down">unreachable</strong>
          }
          @default {
            <span>checking…</span>
          }
        }
      </p>
    </section>
  `,
  styles: `
    .dashboard {
      padding: 2rem 1rem;
    }
    .up {
      color: #1b7f3b;
    }
    .down {
      color: #b3261e;
    }
  `,
})
export class DashboardPage {
  protected readonly status = toSignal(inject(SystemStatusService).backendStatus());
}
