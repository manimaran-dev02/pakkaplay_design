import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

/**
 * Temporary page for feature routes that are not implemented yet. Its title comes from the
 * route's `title`. Each feature replaces it in its own phase (docs/implementation-plan.md).
 */
@Component({
  selector: 'pp-placeholder-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="placeholder">
      <h1>{{ title() }}</h1>
      <p>This section is planned and will be built in a later phase.</p>
    </section>
  `,
  styles: `
    .placeholder {
      padding: 2rem 1rem;
    }
  `,
})
export class PlaceholderPage {
  protected readonly title = toSignal(
    inject(ActivatedRoute).title.pipe(map((title) => title ?? '')),
    { initialValue: '' },
  );
}
