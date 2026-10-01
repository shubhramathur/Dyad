import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';

import {
    RegisterPage,
    type RegistrationData
} from '../pages/paraBank/RegisterPage';
import { AccountsPage } from '../pages/paraBank/AccountsPage';

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
    }
);
