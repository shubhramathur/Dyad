import type { Locator, Page } from '@playwright/test';

type RegistrationData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export class RegisterPage {
  private readonly page: Page;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly registerButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.getByRole('textbox', { name: 'First name:', exact: true });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last name:', exact: true });
    this.emailInput = page.getByRole('textbox', { name: 'Email:', exact: true });
    this.passwordInput = page.getByLabel('Password:', { exact: true });
    this.confirmPasswordInput = page.getByLabel('Confirm password:', { exact: true });
    this.registerButton = page.getByRole('button', { name: 'Register', exact: true });
    this.successMessage = page.getByText('Your registration completed', { exact: true });
  }

  async goto() {
    await this.page.goto('https://demowebshop.tricentis.com/register');
  }

  async register(user: RegistrationData) {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.confirmPasswordInput.fill(user.password);
    await this.registerButton.click();
  }
}
