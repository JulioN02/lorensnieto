import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object for the admin Login page (React frontend at localhost:5173).
 *
 * The login form uses:
 *   - `input#email` for email
 *   - `input#password` for password
 *   - `button[type="submit"]` to submit
 *
 * After a successful login the user is redirected to `/dashboard`.
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('button[type="submit"]');
  }

  /** Navigate to the admin login page. */
  async navigate(): Promise<void> {
    await this.page.goto('http://localhost:5173/login');
  }

  /** Fill credentials and submit the login form. */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /** Wait for redirect to /dashboard and return whether login succeeded. */
  async isLoggedIn(): Promise<boolean> {
    await this.page.waitForURL(/\/dashboard/, { timeout: 15000 });
    return this.page.url().includes('/dashboard');
  }
}
