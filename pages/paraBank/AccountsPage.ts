import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AccountsPage {
    private readonly page: Page;
    private readonly accountNumberLinks: Locator;
    private readonly accountsOverviewLink: Locator;
    private readonly openNewAccountLink: Locator;
    private readonly accountTypeSelect: Locator;
    private readonly fundingAccountSelect: Locator;
    private readonly fundingAccountOptions: Locator;
    private readonly openAccountButton: Locator;
    private readonly accountOpenedHeading: Locator;
    private readonly newAccountNumber: Locator;

    constructor(page: Page) {
        this.page = page;
        this.accountNumberLinks = page.locator(
            '#accountTable tbody tr td a'
        );
        this.accountsOverviewLink = page.getByRole(
            'link',
            {
                name: 'Accounts Overview',
                exact: true
            }
        );
        this.openNewAccountLink = page.getByRole(
            'link',
            {
                name: 'Open New Account',
                exact: true
            }
        );
        this.accountTypeSelect = page.locator(
            '#type'
        );
        this.fundingAccountSelect = page.locator(
            '#fromAccountId'
        );
        this.fundingAccountOptions = this.fundingAccountSelect.locator(
            'option'
        );
        this.openAccountButton = page.getByRole(
            'button',
            {
                name: 'Open New Account',
                exact: true
            }
        );
        this.accountOpenedHeading = page.getByRole(
            'heading',
            {
                name: 'Account Opened!',
                exact: true
            }
        );
        this.newAccountNumber = page.locator(
            '#newAccountId'
        );
    }

    async openAccountsOverview(): Promise<void> {
        await this.accountsOverviewLink.click();

        await expect(
            this.page.getByRole(
                'heading',
                {
                    name: 'Accounts Overview',
                    exact: true
                }
            )
        ).toBeVisible();
    }

    async getInitialAccountNumber(): Promise<string> {
        await this.openAccountsOverview();

        await expect(
            this.accountNumberLinks
        ).toHaveCount(1);

        return (
            await this.accountNumberLinks.first().innerText()
        ).trim();
    }

    async openNewAccount(): Promise<void> {
        await this.openNewAccountLink.click();

        await expect(
            this.page.getByRole(
                'heading',
                {
                    name: 'Open New Account',
                    exact: true
                }
            )
        ).toBeVisible();
    }

    async createCheckingAccount(
        fundingAccountNumber: string
    ): Promise<string> {
        await this.openNewAccount();

        const fundingAccountOption =
            this.fundingAccountOptions.filter({
                hasText: fundingAccountNumber
            });

        await expect(
            fundingAccountOption
        ).toHaveCount(1);

        await this.accountTypeSelect.selectOption({
            label: 'CHECKING'
        });

        await this.fundingAccountSelect.selectOption(
            fundingAccountNumber
        );

        await this.openAccountButton.click();

        await expect(
            this.accountOpenedHeading
        ).toBeVisible();

        await expect(
            this.newAccountNumber
        ).toBeVisible();

        return (
            await this.newAccountNumber.innerText()
        ).trim();
    }
}
