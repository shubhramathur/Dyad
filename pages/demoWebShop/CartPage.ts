import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class CartPage {
    private readonly page: Page;
    private readonly cartRows: Locator;
    private readonly productNames: Locator;
    private readonly cartCount: Locator;
    private readonly updateCartButton: Locator;
    private readonly subtotalValue: Locator;
    private readonly couponInput: Locator;
    private readonly applyCouponButton: Locator;
    private readonly couponErrorMessage: Locator;

    constructor(page: Page) {
        this.page = page;

        // All product rows inside Shopping Cart
        this.cartRows = page.locator(
            'table.cart tbody tr'
        );

        // Product names inside Shopping Cart
        this.productNames = page.locator(
            'table.cart tbody tr td.product a'
        );

        // Shopping Cart count displayed in header
        this.cartCount = page.locator(
            '.header-links .cart-qty'
        );

        // Update Shopping Cart button
        this.updateCartButton = page.getByRole(
            'button',
            {
                name: 'Update shopping cart',
                exact: true
            }
        );

        // Locate the row containing "Sub-Total:"
        // and take the last cell which contains the value.
        this.subtotalValue = page
            .locator('table.cart-total tr')
            .filter({
                hasText: 'Sub-Total:'
            })
            .locator('td')
            .last();

        this.couponInput = page.locator(
            'input[name="discountcouponcode"]'
        );

        this.applyCouponButton = page.getByRole(
            'button',
            {
                name: 'Apply coupon',
                exact: true
            }
        );

        this.couponErrorMessage = page.locator(
            '.coupon-box .message'
        );
    }

    async verifyProductCount(
        expectedCount: number
    ): Promise<void> {
        await expect(
            this.cartRows
        ).toHaveCount(expectedCount);
    }

    async verifyProducts(
        expectedProducts: string[]
    ): Promise<void> {
        const actualProducts =
            await this.productNames.allTextContents();

        const trimmedProducts =
            actualProducts.map(
                name => name.trim()
            );

        for (const product of expectedProducts) {
            expect(
                trimmedProducts
            ).toContain(product);
        }
    }

    async getProductCount(): Promise<number> {
        return await this.cartRows.count();
    }

    async updateFirstProductQuantity(
        quantity: number
    ): Promise<void> {
        const firstRow =
            this.cartRows.first();

        const quantityInput =
            firstRow.locator(
                'input.qty-input'
            );

        await expect(
            quantityInput
        ).toBeVisible();

        await quantityInput.fill(
            quantity.toString()
        );

        await this.updateCartButton.click();

        // Re-locate the quantity input after cart refresh
        const updatedQuantityInput =
            this.cartRows
                .first()
                .locator('input.qty-input');

        await expect(
            updatedQuantityInput
        ).toHaveValue(
            quantity.toString()
        );
    }

    async calculateExpectedSubtotal(): Promise<number> {
        const rowCount =
            await this.cartRows.count();

        let expectedSubtotal = 0;

        for (
            let index = 0;
            index < rowCount;
            index++
        ) {
            const row =
                this.cartRows.nth(index);

            // Read unit price dynamically from UI
            const unitPriceText =
                await row
                    .locator('.product-unit-price')
                    .innerText();

            // Read current quantity dynamically
            const quantityText =
                await row
                    .locator('input.qty-input')
                    .inputValue();

            const unitPrice =
                this.parseCurrency(
                    unitPriceText
                );

            const quantity =
                Number(quantityText);

            expectedSubtotal +=
                unitPrice * quantity;
        }

        return expectedSubtotal;
    }

    async getDisplayedSubtotal(): Promise<number> {
        await expect(
            this.subtotalValue
        ).toBeVisible();

        const subtotalText =
            await this.subtotalValue.innerText();

        return this.parseCurrency(
            subtotalText
        );
    }

    async verifySubtotalCalculation(): Promise<void> {
        const expectedSubtotal =
            await this.calculateExpectedSubtotal();

        const displayedSubtotal =
            await this.getDisplayedSubtotal();

        console.log(
            'Expected subtotal:',
            expectedSubtotal
        );

        console.log(
            'Displayed subtotal:',
            displayedSubtotal
        );

        expect(
            displayedSubtotal
        ).toBeCloseTo(
            expectedSubtotal,
            2
        );
    }

    async applyCoupon(couponCode: string): Promise<void> {
        await this.couponInput.fill(couponCode);
        await this.applyCouponButton.click();
    }

    async getCouponErrorMessage(): Promise<string> {
        await expect(
            this.couponErrorMessage
        ).toBeVisible();

        return (
            await this.couponErrorMessage.innerText()
        ).trim();
    }

    async addFallbackBookToCart(): Promise<void> {
        // Navigate to Books category
        await this.page.goto(
            'https://demowebshop.tricentis.com/books'
        );

        await expect(
            this.page.getByRole(
                'heading',
                {
                    name: 'Books'
                }
            )
        ).toBeVisible();

        // Open known purchasable book
        await this.page.getByRole(
            'link',
            {
                name: 'Computing and Internet',
                exact: true
            }
        ).first().click();

        // Main product-detail Add to Cart button
        const addToCartButton =
            this.page.locator(
                '.product-essential .add-to-cart-button'
            );

        await expect(
            addToCartButton
        ).toBeVisible();

        await addToCartButton.click();

        // Wait until AJAX updates Shopping Cart count
        await expect(
            this.cartCount
        ).toHaveText('(2)');

        // Open Shopping Cart
        await this.page.goto(
            'https://demowebshop.tricentis.com/cart'
        );

        await expect(
            this.page
        ).toHaveURL(/cart/);
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
