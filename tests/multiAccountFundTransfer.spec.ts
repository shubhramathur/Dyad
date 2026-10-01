import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';

import {
    RegisterPage,
    type RegistrationData
} from '../pages/paraBank/RegisterPage';
import { AccountsPage } from '../pages/paraBank/AccountsPage';
import { TransferPage } from '../pages/paraBank/TransferPage';

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
    }
);
