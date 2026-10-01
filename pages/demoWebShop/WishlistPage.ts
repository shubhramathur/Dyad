import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class WishlistPage {
    private readonly wishlistRows: Locator;
    private readonly productNames: Locator;

    constructor(page: Page) {
        this.wishlistRows = page.locator('table.cart tbody tr');

        this.productNames = page.locator(
            'table.cart tbody tr td.product a'
        );
    }

    async verifyProductCount(expectedCount: number): Promise<void> {
        await expect(this.wishlistRows).toHaveCount(expectedCount);
    }

    async verifyProducts(expectedProducts: string[]): Promise<void> {
        const actualProducts = await this.productNames.allTextContents();

        const trimmedProducts = actualProducts.map(
            name => name.trim()
        );

        for (const product of expectedProducts) {
            expect(trimmedProducts).toContain(product);
        }
    }
}