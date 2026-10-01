import type { Locator, Page } from '@playwright/test';

export class HeaderPage {
    private readonly logoutLink: Locator;
    readonly loginLink: Locator;

    constructor(page: Page) {
        this.logoutLink = page.getByRole(
            'link',
            {
                name: 'Log out',
                exact: true
            }
        );

        this.loginLink = page.getByRole(
            'link',
            {
                name: 'Log in',
                exact: true
            }
        );
    }

    async logout(): Promise<void> {
        await this.logoutLink.click();
    }
}
