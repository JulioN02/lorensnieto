import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object for the public-facing site (vanilla HTML at localhost:3001).
 *
 * The public site uses a shared header with navigation links and
 * renders property cards inside `<article class="card">` elements.
 *
 * Usage:
 *   const home = new PublicHomePage(page);
 *   await home.navigate();
 *   await home.navigateToPropertyType('Casas de Campo');
 *   await home.clickFirstPropertyCard();
 */
export class PublicHomePage {
  readonly page: Page;
  readonly heroTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heroTitle = page.locator('h1');
  }

  /** Navigate to the public landing page. */
  async navigate(): Promise<void> {
    await this.page.goto('http://localhost:3001');
  }

  /** Click a header navigation link by its visible label. */
  async navigateToPropertyType(typeLabel: string): Promise<void> {
    await this.page.locator(`header a:has-text("${typeLabel}")`).click();
  }

  /** Click the first property card's "Ver más" link to open its detail page. */
  async clickFirstPropertyCard(): Promise<void> {
    await this.page.locator('.card a').first().click();
  }
}
