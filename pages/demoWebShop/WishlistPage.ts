import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class WishlistPage {
    private readonly page: Page;
    private readonly wishlistRows: Locator;
    private readonly productNames: Locator;
    private readonly addToCartButton: Locator;

    constructor(page: Page) {
        this.page = page;

        this.wishlistRows = page.locator('table.cart tbody tr');

        this.productNames = page.locator(
            'table.cart tbody tr td.product a'
        );

        this.addToCartButton = page.locator(
            'input[name="addtocartbutton"]'
        );
    }

    async verifyProductCount(
        expectedCount: number
    ): Promise<void> {
        await expect(
            this.wishlistRows
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
            expect(trimmedProducts).toContain(product);
        }
    }

    async moveProductToCart(
        productName: string
    ): Promise<void> {
        const productRow = this.wishlistRows.filter({
            has: this.page.getByRole('link', {
                name: productName,
                exact: true,
            }),
        });

        await expect(productRow).toHaveCount(1);

        const addToCartCheckbox = productRow.locator(
            'input[name="addtocart"]'
        );

        await expect(addToCartCheckbox).toBeVisible();

        await addToCartCheckbox.check();

        await expect(addToCartCheckbox).toBeChecked();

        await this.addToCartButton.click();
    }

    async gotoWishlist(): Promise<void> {
        await this.page.goto(
            'https://demowebshop.tricentis.com/wishlist'
        );

        await expect(
            this.page
        ).toHaveURL(/wishlist/);
    }

    async getProductCount(): Promise<number> {
        return await this.wishlistRows.count();
    }
}