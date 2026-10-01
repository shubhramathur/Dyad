import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';

import {
    RegisterPage,
    type RegistrationData
} from '../pages/paraBank/RegisterPage';
import { AccountsPage } from '../pages/paraBank/AccountsPage';
import { TransferPage } from '../pages/paraBank/TransferPage';
import {
    AccountDetailsPage,
    type TransactionRecord
} from '../pages/paraBank/AccountDetailsPage';

function assertTransactionDateIsCurrent(
    dateText: string
): void {
    const dateParts = /^(\d{2})-(\d{2})-(\d{4})$/.exec(
        dateText.trim()
    );

    expect(
        dateParts,
        `Expected ParaBank date in MM-dd-yyyy format, received: ${dateText}`
    ).not.toBeNull();

    const month = Number(dateParts?.[1]);
    const day = Number(dateParts?.[2]);
    const year = Number(dateParts?.[3]);
    const transactionDate = new Date(
        Date.UTC(year, month - 1, day)
    );

    expect(
        transactionDate.getUTCFullYear()
    ).toBe(year);

    expect(
        transactionDate.getUTCMonth()
    ).toBe(month - 1);

    expect(
        transactionDate.getUTCDate()
    ).toBe(day);

    const today = new Date();
    const todayUtc = Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    const dayDifference = Math.abs(
        todayUtc - transactionDate.getTime()
    ) / (24 * 60 * 60 * 1000);

    expect(dayDifference).toBeLessThanOrEqual(1);
}

test(
    'Scenario 6: creates two distinct bank accounts',
    async ({ page }) => {
        const uniqueId =
            randomUUID().replaceAll('-', '').slice(0, 12);

        const user: RegistrationData = {
            firstName: 'QA',
            lastName: 'User',
            address: '123 Test Street',
            city: 'Test City',
            state: 'NY',
            zipCode: '10001',
            phoneNumber: '2125550100',
            ssn: uniqueId.slice(0, 9),
            username: `qauser_${uniqueId}`,
            password: `Qa@123_${uniqueId}`
        };

        const registerPage =
            new RegisterPage(page);

        const accountsPage =
            new AccountsPage(page);

        const transferPage =
            new TransferPage(page);

        const accountDetailsPage =
            new AccountDetailsPage(page);

        await registerPage.goto();
        await registerPage.register(user);

        await expect(
            registerPage.registrationSuccessMessage
        ).toBeVisible();

        await expect(
            registerPage.logoutLink
        ).toBeVisible();

        const initialAccountNumber =
            await accountsPage.getInitialAccountNumber();

        expect(initialAccountNumber).not.toBe('');

        console.log(
            'Initial Account:',
            initialAccountNumber
        );

        const firstAccountNumber =
            await accountsPage.createCheckingAccount(
                initialAccountNumber
            );

        expect(firstAccountNumber).not.toBe('');

        console.log(
            'First New Account:',
            firstAccountNumber
        );

        const secondAccountNumber =
            await accountsPage.createCheckingAccount(
                initialAccountNumber
            );

        expect(secondAccountNumber).not.toBe('');

        console.log(
            'Second New Account:',
            secondAccountNumber
        );

        expect(
            firstAccountNumber
        ).not.toBe(
            secondAccountNumber
        );

        const sourceBalanceBefore =
            await accountsPage.getAccountBalance(
                firstAccountNumber
            );

        const destinationBalanceBefore =
            await accountsPage.getAccountBalance(
                secondAccountNumber
            );

        expect(sourceBalanceBefore).toBeGreaterThan(0);
        expect(destinationBalanceBefore).toBeGreaterThanOrEqual(0);

        console.log(
            'Source Balance Before:',
            sourceBalanceBefore
        );

        console.log(
            'Destination Balance Before:',
            destinationBalanceBefore
        );

        const transferAmount =
            sourceBalanceBefore > 250
                ? 250
                : Number(
                    (sourceBalanceBefore / 2).toFixed(2)
                );

        expect(transferAmount).toBeGreaterThan(0);
        expect(transferAmount).toBeLessThan(
            sourceBalanceBefore
        );

        console.log(
            'Transfer Amount:',
            transferAmount
        );

        await transferPage.transferFunds(
            transferAmount,
            firstAccountNumber,
            secondAccountNumber
        );

        const transferConfirmation =
            await transferPage
                .getTransferConfirmationMessage();

        expect(
            transferConfirmation
        ).toBe(
            `$${transferAmount.toFixed(2)} has been ` +
            `transferred from account #${firstAccountNumber} ` +
            `to account #${secondAccountNumber}.`
        );

        const expectedSourceBalanceAfter =
            sourceBalanceBefore - transferAmount;

        const expectedDestinationBalanceAfter =
            destinationBalanceBefore + transferAmount;

        console.log(
            'Expected Source Balance After:',
            expectedSourceBalanceAfter
        );

        console.log(
            'Expected Destination Balance After:',
            expectedDestinationBalanceAfter
        );

        const sourceBalanceAfter =
            await accountsPage.getAccountBalance(
                firstAccountNumber
            );

        const destinationBalanceAfter =
            await accountsPage.getAccountBalance(
                secondAccountNumber
            );

        console.log(
            'Actual Source Balance After:',
            sourceBalanceAfter
        );

        console.log(
            'Actual Destination Balance After:',
            destinationBalanceAfter
        );

        expect(
            sourceBalanceAfter
        ).toBeCloseTo(
            expectedSourceBalanceAfter,
            2
        );

        expect(
            destinationBalanceAfter
        ).toBeCloseTo(
            expectedDestinationBalanceAfter,
            2
        );

        await accountsPage.openAccountDetails(
            firstAccountNumber
        );

        await expect(
            accountDetailsPage.accountNumber
        ).toHaveText(
            firstAccountNumber
        );

        const sourceTransaction =
            await accountDetailsPage
                .findTransferTransaction(
                    transferAmount,
                    'debit'
                );

        expect(
            sourceTransaction
        ).toBeDefined();

        const sourceRecord =
            sourceTransaction as TransactionRecord;

        expect(
            sourceRecord.description
        ).toBe(
            'Funds Transfer Sent'
        );

        expect(
            sourceRecord.amount
        ).toBeCloseTo(
            transferAmount,
            2
        );

        assertTransactionDateIsCurrent(
            sourceRecord.date
        );

        const matchingSourceTransactions =
            await accountDetailsPage
                .findMatchingTransferTransactions(
                    transferAmount,
                    'debit',
                    sourceRecord.date
                );

        expect(
            matchingSourceTransactions.length
        ).toBe(1);

        expect(
            sourceRecord.reference
        ).toBeTruthy();

        const sourceReference =
            sourceRecord.reference as string;

        expect(
            await accountDetailsPage
                .getTransactionReferenceCount(
                    sourceReference
                )
        ).toBe(1);

        console.log(
            'Source Transaction Date:',
            sourceRecord.date
        );

        console.log(
            'Source Transaction Description:',
            sourceRecord.description
        );

        console.log(
            'Source Transaction Amount:',
            sourceRecord.amount
        );

        console.log(
            'Source matching transaction count:',
            matchingSourceTransactions.length
        );

        console.log(
            'Source transaction reference:',
            sourceReference
        );

        await accountsPage.openAccountDetails(
            secondAccountNumber
        );

        await expect(
            accountDetailsPage.accountNumber
        ).toHaveText(
            secondAccountNumber
        );

        const destinationTransaction =
            await accountDetailsPage
                .findTransferTransaction(
                    transferAmount,
                    'credit'
                );

        expect(
            destinationTransaction
        ).toBeDefined();

        const destinationRecord =
            destinationTransaction as TransactionRecord;

        expect(
            destinationRecord.description
        ).toBe(
            'Funds Transfer Received'
        );

        expect(
            destinationRecord.amount
        ).toBeCloseTo(
            transferAmount,
            2
        );

        assertTransactionDateIsCurrent(
            destinationRecord.date
        );

        const matchingDestinationTransactions =
            await accountDetailsPage
                .findMatchingTransferTransactions(
                    transferAmount,
                    'credit',
                    destinationRecord.date
                );

        expect(
            matchingDestinationTransactions.length
        ).toBe(1);

        expect(
            destinationRecord.reference
        ).toBeTruthy();

        const destinationReference =
            destinationRecord.reference as string;

        expect(
            await accountDetailsPage
                .getTransactionReferenceCount(
                    destinationReference
                )
        ).toBe(1);

        console.log(
            'Destination Transaction Date:',
            destinationRecord.date
        );

        console.log(
            'Destination Transaction Description:',
            destinationRecord.description
        );

        console.log(
            'Destination Transaction Amount:',
            destinationRecord.amount
        );

        console.log(
            'Destination matching transaction count:',
            matchingDestinationTransactions.length
        );

        console.log(
            'Destination transaction reference:',
            destinationReference
        );
    }
);
