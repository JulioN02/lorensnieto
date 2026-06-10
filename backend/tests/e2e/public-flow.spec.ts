import { test } from '@playwright/test';
import { PublicHomePage } from './pages/PublicHomePage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';

/**
 * E2E test: Public site flow
 *
 * Prerequisites:
 *   - Backend running on localhost:3000 (auto-started by webServer in config)
 *   - Frontend-public running on localhost:3001
 *   - Database has at least one property of type "casa_campo"
 *
 * Steps:
 *   1. Visit landing page
 *   2. Navigate to Casas de Campo listing
 *   3. Click the first property to view its detail
 *   4. Open the lead/solicitud form
 *   5. Fill customer data and submit
 *   6. Verify success message
 */
test.describe('Flujo Público', () => {
  test('un usuario puede navegar y enviar una solicitud', async ({ page }) => {
    const home = new PublicHomePage(page);
    const detail = new PropertyDetailPage(page);

    // 1. Visit landing page
    await test.step('Visitar página de inicio', async () => {
      await home.navigate();
      await home.heroTitle.waitFor({ state: 'visible', timeout: 10000 });
    });

    // 2. Navigate to Casas de Campo
    await test.step('Navegar a Casas de Campo', async () => {
      await home.navigateToPropertyType('Casas de Campo');
      await page.waitForURL(/casas-campo/, { timeout: 10000 });
    });

    // 3. Click first property to see detail
    await test.step('Ver detalle de propiedad', async () => {
      await home.clickFirstPropertyCard();
      await detail.isLoaded();
    });

    // 4. Open lead modal
    await test.step('Abrir formulario de solicitud', async () => {
      await detail.openLeadForm();
    });

    // 5. Fill form and submit
    await test.step('Llenar y enviar formulario', async () => {
      await detail.fillLeadForm({
        name: 'Cliente Test E2E',
        cedula: '1234567890',
        phone: '3001234567',
        email: 'test-e2e@lorensnieto.com',
      });
      await detail.submitLeadForm();
    });

    // 6. Verify success
    await test.step('Verificar confirmación', async () => {
      await detail.waitForSuccess();
    });
  });
});
