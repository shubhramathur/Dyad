import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/demoWebShop/RegisterPage';

test('Scenario 5: user registration is successful', async ({ page }) => {
  const user = {
    firstName: 'QA',
    lastName: 'User',
    email: `qauser_${randomUUID()}@example.com`,
    password: `Qa@123_${randomUUID()}`,
  };

  const registerPage = new RegisterPage(page);
  await registerPage.goto();
  await registerPage.register(user);

  await expect(registerPage.successMessage).toBeVisible();
});
