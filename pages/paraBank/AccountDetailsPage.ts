import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export type TransactionDirection =
    'debit' | 'credit';

export type TransactionRecord = {
    date: string;
    description: string;
    amount: number;
    reference?: string;
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
        direction: TransactionDirection,
        transactionDate?: string
    ): Promise<TransactionRecord | undefined> {
        const matchingTransactions =
            await this.findMatchingTransferTransactions(
                transferAmount,
                direction,
                transactionDate
            );

        return matchingTransactions[0];
    }

    async findMatchingTransferTransactions(
        transferAmount: number,
        direction: TransactionDirection,
        transactionDate?: string
    ): Promise<TransactionRecord[]> {
        await this.waitForTransactions();

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
        const matchingTransactions: TransactionRecord[] = [];

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
                amount === transferAmount &&
                (!transactionDate || date === transactionDate)
            ) {
                matchingTransactions.push({
                    date,
                    description,
                    amount,
                    reference:
                        await this.getTransactionReference(row)
                });
            }
        }

        return matchingTransactions;
    }

    async getTransactionReferenceCount(
        reference: string
    ): Promise<number> {
        await this.waitForTransactions();

        const rowCount =
            await this.transactionRows.count();
        let referenceCount = 0;

        for (
            let index = 0;
            index < rowCount;
            index++
        ) {
            const row =
                this.transactionRows.nth(index);
            const rowReference =
                await this.getTransactionReference(row);

            if (rowReference === reference) {
                referenceCount++;
            }
        }

        return referenceCount;
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

    private async waitForTransactions(): Promise<void> {
        await expect(
            this.accountNumber
        ).toHaveText(/\d+/);

        await expect(
            this.transactionRows
        ).not.toHaveCount(0);
    }

    private async getTransactionReference(
        row: Locator
    ): Promise<string | undefined> {
        const href = await row
            .locator('td')
            .nth(1)
            .locator('a')
            .getAttribute('href');
        const referenceMatch = /[?&]id=([^&#]+)/.exec(
            href ?? ''
        );

        return referenceMatch?.[1];
    }
}
