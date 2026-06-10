import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { NavigationPage } from './pages/NavigationPage';

/**
 * E2E test: Admin panel flow
 *
 * Prerequisites:
 *   - Backend running on localhost:3000 (auto-started by webServer in config)
 *   - Frontend-admin running on localhost:5173
 *   - Database has an admin user (lorena@lorensnieto.com / admin123)
 *   - Database has at least one active property
 *
 * Steps:
 *   1. Navigate to admin login page
 *   2. Login with admin credentials
 *   3. Verify redirect to dashboard
 *   4. Navigate to Reservas section
 *   5. Click "Nueva Reserva"
 *   6. Fill reservation form
 *   7. Submit and verify redirect to detail page
 */
test.describe('Flujo Admin', () => {
  test('admin puede iniciar sesión y crear una reserva', async ({ page }) => {
    const login = new LoginPage(page);
    const nav = new NavigationPage(page);

    // 1. Login as admin
    await test.step('Iniciar sesión como administradora', async () => {
      await login.navigate();
      await login.login('lorena@lorensnieto.com', 'admin123');
      expect(await login.isLoggedIn()).toBe(true);
    });

    // 2. Navigate to reservations
    await test.step('Navegar a la sección de Reservas', async () => {
      await nav.navigateTo('Reservas');
      await page.waitForURL(/reservations/, { timeout: 10000 });
    });

    // 3. Click Nueva Reserva
    await test.step('Abrir formulario de nueva reserva', async () => {
      await page.locator('text=Nueva Reserva').click();
      await page.waitForURL(/reservations\/new/, { timeout: 10000 });
    });

    // 4. Fill the reservation form
    await test.step('Llenar datos del cliente y fechas', async () => {
      // Select the first available property from the dropdown
      await page.selectOption('select[name="propertyId"]', { index: 1 });

      // Customer info
      await page.fill('input[name="customerName"]', 'Test E2E');
      await page.fill('input[name="customerCedula"]', '12345');
      await page.fill('input[name="customerPhone"]', '3001112233');
      await page.fill('input[name="customerEmail"]', 'e2e-test@lorensnieto.com');

      // Dates
      await page.fill('input[name="dateStart"]', '2026-07-01');
      await page.fill('input[name="dateEnd"]', '2026-07-03');
    });

    // 5. Submit the form
    await test.step('Enviar formulario', async () => {
      await page.locator('button[type="submit"]').click();
    });

    // 6. Verify redirect to reservation detail page (not /new)
    await test.step('Verificar redirección al detalle de reserva', async () => {
      await page.waitForURL(/\/reservations\/(?!new)/, { timeout: 15000 });
      // The detail page should show the property name as heading
      await expect(page.locator('h2')).toBeVisible({ timeout: 10000 });
    });
  });
});
