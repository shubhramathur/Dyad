import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export type TransactionDirection =
    'debit' | 'credit';

export type TransactionRecord = {
    date: string;
    description: string;
    amount: number;
};

export class AccountDetailsPage {
    private readonly transactionRows: Locator;
    readonly accountNumber: Locator;

    constructor(page: Page) {
        this.accountNumber = page.locator(
            '#accountId'
        );
        this.transactionRows = page.locator(
            '#transactionTable tbody tr'
        );
    }

    async findTransferTransaction(
        transferAmount: number,
        direction: TransactionDirection
    ): Promise<TransactionRecord | undefined> {
        await expect(
            this.accountNumber
        ).toHaveText(/\d+/);

        await expect(
            this.transactionRows
        ).not.toHaveCount(0);

        const expectedDescription =
            direction === 'debit'
                ? 'Funds Transfer Sent'
                : 'Funds Transfer Received';

        const amountColumn =
            direction === 'debit'
                ? 2
                : 3;

        const rowCount =
            await this.transactionRows.count();

        for (
            let index = 0;
            index < rowCount;
            index++
        ) {
            const row =
                this.transactionRows.nth(index);

            const date = (
                await row.locator('td').nth(0).innerText()
            ).trim();

            const description = (
                await row.locator('td').nth(1).innerText()
            ).trim();

            const amountText = (
                await row
                    .locator('td')
                    .nth(amountColumn)
                    .innerText()
            ).trim();

            const amount =
                this.parseCurrency(amountText);

            if (
                description === expectedDescription &&
                amount === transferAmount
            ) {
                return {
                    date,
                    description,
                    amount
                };
            }
        }

        return undefined;
    }

    private parseCurrency(
        value: string
    ): number {
        return Number(
            value.replace(
                /[^0-9.-]+/g,
                ''
            )
        );
    }
}
