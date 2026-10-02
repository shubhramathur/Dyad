import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export type TransferOutcome = {
    successConfirmationVisible: boolean;
    message: string;
};

export class TransferPage {
    private readonly page: Page;
    private readonly transferFundsLink: Locator;
    private readonly transferHeading: Locator;
    private readonly amountInput: Locator;
    private readonly fromAccountSelect: Locator;
    private readonly toAccountSelect: Locator;
    private readonly fromAccountOptions: Locator;
    private readonly toAccountOptions: Locator;
    private readonly transferButton: Locator;
    readonly transferCompleteHeading: Locator;
    private readonly transferConfirmationMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.transferFundsLink = page.getByRole(
            'link',
            {
                name: 'Transfer Funds',
                exact: true
            }
        );
        this.transferHeading = page.getByRole(
            'heading',
            {
                name: 'Transfer Funds',
                exact: true
            }
        );
        this.amountInput = page.locator(
            '#amount'
        );
        this.fromAccountSelect = page.locator(
            '#fromAccountId'
        );
        this.toAccountSelect = page.locator(
            '#toAccountId'
        );
        this.fromAccountOptions = this.fromAccountSelect.locator(
            'option'
        );
        this.toAccountOptions = this.toAccountSelect.locator(
            'option'
        );
        this.transferButton = page.getByRole(
            'button',
            {
                name: 'Transfer',
                exact: true
            }
        );
        this.transferCompleteHeading = page.getByRole(
            'heading',
            {
                name: 'Transfer Complete!',
                exact: true
            }
        );
        this.transferConfirmationMessage = page.getByText(
            /has been transferred from account #\d+ to account #\d+\./
        );
    }

    async openTransferFunds(): Promise<void> {
        await this.transferFundsLink.click();

        await expect(
            this.transferHeading
        ).toBeVisible();
    }

    async transferFunds(
        amount: number,
        sourceAccountNumber: string,
        destinationAccountNumber: string
    ): Promise<void> {
        await this.openTransferFunds();

        const sourceOption =
            this.fromAccountOptions.filter({
                hasText: sourceAccountNumber
            });

        const destinationOption =
            this.toAccountOptions.filter({
                hasText: destinationAccountNumber
            });

        await expect(
            sourceOption
        ).toHaveCount(1);

        await expect(
            destinationOption
        ).toHaveCount(1);

        await this.amountInput.fill(
            amount.toString()
        );

        await this.fromAccountSelect.selectOption(
            sourceAccountNumber
        );

        await this.toAccountSelect.selectOption(
            destinationAccountNumber
        );

        await this.transferButton.click();
    }

    async getTransferConfirmationMessage(): Promise<string> {
        await expect(
            this.transferCompleteHeading
        ).toBeVisible();

        await expect(
            this.transferConfirmationMessage
        ).toBeVisible();

        return (
            await this.transferConfirmationMessage.innerText()
        ).trim();
    }

    async getTransferOutcome(): Promise<TransferOutcome> {
        await this.page.waitForLoadState(
            'domcontentloaded'
        );

        if (
            await this.transferCompleteHeading.isVisible()
        ) {
            return {
                successConfirmationVisible: true,
                message:
                    await this.getTransferConfirmationMessage()
            };
        }

        const resultMessage = (
            await this.page
                .locator('#rightPanel')
                .innerText()
        ).trim();

        expect(resultMessage).not.toBe('');

        return {
            successConfirmationVisible: false,
            message: resultMessage
        };
    }
}
