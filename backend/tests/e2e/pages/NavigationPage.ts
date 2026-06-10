import { type Page } from '@playwright/test';

/**
 * Page Object for the admin sidebar navigation.
 *
 * The sidebar renders `<NavLink>` components with labels like
 * "Dashboard", "Propiedades", "Reservas", "Reportes", etc.
 *
 * Usage:
 *   const nav = new NavigationPage(page);
 *   await nav.navigateTo('Reservas');
 */
export class NavigationPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Click a navigation link by its visible label text. */
  async navigateTo(sectionLabel: string): Promise<void> {
    await this.page.locator(`nav a:has-text("${sectionLabel}")`).click();
  }
}
