import type { Locator, Page } from '@playwright/test';

export type RegistrationData = {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phoneNumber: string;
    ssn: string;
    username: string;
    password: string;
};

export class RegisterPage {
    private readonly page: Page;
    private readonly firstNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly addressInput: Locator;
    private readonly cityInput: Locator;
    private readonly stateInput: Locator;
    private readonly zipCodeInput: Locator;
    private readonly phoneNumberInput: Locator;
    private readonly ssnInput: Locator;
    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly repeatedPasswordInput: Locator;
    private readonly registerButton: Locator;
    readonly registrationSuccessMessage: Locator;
    readonly logoutLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.firstNameInput = page.locator(
            '[name="customer.firstName"]'
        );
        this.lastNameInput = page.locator(
            '[name="customer.lastName"]'
        );
        this.addressInput = page.locator(
            '[name="customer.address.street"]'
        );
        this.cityInput = page.locator(
            '[name="customer.address.city"]'
        );
        this.stateInput = page.locator(
            '[name="customer.address.state"]'
        );
        this.zipCodeInput = page.locator(
            '[name="customer.address.zipCode"]'
        );
        this.phoneNumberInput = page.locator(
            '[name="customer.phoneNumber"]'
        );
        this.ssnInput = page.locator(
            '[name="customer.ssn"]'
        );
        this.usernameInput = page.locator(
            '[name="customer.username"]'
        );
        this.passwordInput = page.locator(
            '[name="customer.password"]'
        );
        this.repeatedPasswordInput = page.locator(
            '[name="repeatedPassword"]'
        );
        this.registerButton = page.getByRole(
            'button',
            {
                name: 'Register',
                exact: true
            }
        );
        this.registrationSuccessMessage = page.getByText(
            'Your account was created successfully. You are now logged in.',
            {
                exact: false
            }
        );
        this.logoutLink = page.getByRole(
            'link',
            {
                name: 'Log Out',
                exact: true
            }
        );
    }

    async goto(): Promise<void> {
        await this.page.goto(
            'https://parabank.parasoft.com/parabank/register.htm'
        );
    }

    async register(user: RegistrationData): Promise<void> {
        await this.firstNameInput.fill(user.firstName);
        await this.lastNameInput.fill(user.lastName);
        await this.addressInput.fill(user.address);
        await this.cityInput.fill(user.city);
        await this.stateInput.fill(user.state);
        await this.zipCodeInput.fill(user.zipCode);
        await this.phoneNumberInput.fill(user.phoneNumber);
        await this.ssnInput.fill(user.ssn);
        await this.usernameInput.fill(user.username);
        await this.passwordInput.fill(user.password);
        await this.repeatedPasswordInput.fill(user.password);
        await this.registerButton.click();
    }
}
