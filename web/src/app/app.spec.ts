import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { NAV_ITEMS } from './layout/nav-items';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('renders the brand and one link per navigation item', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.brand')?.textContent).toContain('Pakka Play');
    expect(el.querySelectorAll('nav a').length).toBe(NAV_ITEMS.length);
  });
});

describe('app routes', () => {
  it('lazy-loads every navigation target', async () => {
    for (const item of NAV_ITEMS) {
      const route = routes.find((r) => `/${r.path}` === item.path);
      expect(route?.loadChildren, item.path).toBeTypeOf('function');
      const children = await route!.loadChildren!();
      expect(Array.isArray(children), item.path).toBe(true);
    }
  });
});
