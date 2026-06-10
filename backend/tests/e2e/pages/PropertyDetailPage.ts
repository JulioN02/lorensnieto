import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object for the public property detail page (property.html?id=X).
 *
 * The lead form is rendered inside a `.modal-overlay` and contains:
 *   - `input[name="customerName"]`
 *   - `input[name="customerCedula"]`
 *   - `input[name="customerPhone"]`
 *   - `input[name="customerEmail"]`
 *
 * On success the modal body is replaced with a `.form-success` div.
 *
 * Usage:
 *   const detail = new PropertyDetailPage(page);
 *   await detail.isLoaded();
 *   await detail.openLeadForm();
 *   await detail.fillLeadForm({ ... });
 *   await detail.submitLeadForm();
 *   await detail.waitForSuccess();
 */
export class PropertyDetailPage {
  readonly page: Page;
  readonly detailContainer: Locator;
  readonly requestInfoBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.detailContainer = page.locator('#content');
    this.requestInfoBtn = page.locator('#btnRequestInfo');
  }

  /** Wait for the property detail content to be visible. */
  async isLoaded(): Promise<void> {
    await this.detailContainer.waitFor({ state: 'visible', timeout: 10000 });
  }

  /** Click "Solicitar Información" to open the lead modal. */
  async openLeadForm(): Promise<void> {
    await this.requestInfoBtn.click();
    await this.page.locator('.modal-overlay').waitFor({ state: 'visible', timeout: 5000 });
  }

  /** Fill all lead form fields inside the modal. */
  async fillLeadForm(data: {
    name: string;
    cedula: string;
    phone: string;
    email: string;
  }): Promise<void> {
    await this.page.locator('input[name="customerName"]').fill(data.name);
    await this.page.locator('input[name="customerCedula"]').fill(data.cedula);
    await this.page.locator('input[name="customerPhone"]').fill(data.phone);
    await this.page.locator('input[name="customerEmail"]').fill(data.email);
  }

  /** Submit the lead form (button labeled "Enviar Solicitud"). */
  async submitLeadForm(): Promise<void> {
    await this.page.locator('#leadForm button[type="submit"]').click();
  }

  /** Wait for the success confirmation inside the modal. */
  async waitForSuccess(): Promise<void> {
    await this.page.locator('.form-success').waitFor({ state: 'visible', timeout: 10000 });
  }
}
