import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class SearchPage {
    private readonly page: Page;
    private readonly searchInput: Locator;
    private readonly searchButton: Locator;
    private readonly wishlistLink: Locator;
    private readonly wishlistCount: Locator;

    constructor(page: Page) {
        this.page = page;

        this.searchInput = page.locator('#small-searchterms');

        this.searchButton = page.locator('input.search-box-button');

        this.wishlistLink = page
            .getByRole('link', { name: /Wishlist \(\d+\)/ })
            .first();

        this.wishlistCount = page.locator('.wishlist-qty').first();
    }

    async searchProduct(keyword: string): Promise<void> {
        await this.searchInput.fill(keyword);
        await this.searchButton.click();

        await expect(
            this.page.locator('.product-item').first()
        ).toBeVisible();
    }

    async openBooksCategory(): Promise<void> {
        await this.page.goto(
            'https://demowebshop.tricentis.com/books'
        );

        await expect(
            this.page.getByRole('heading', { name: 'Books' })
        ).toBeVisible();
    }

    async addBookToWishlist(productName: string): Promise<void> {
        await this.page.getByRole('link', {
            name: productName,
            exact: true
        }).first().click();

        const wishlistButton =
            this.page.locator('.add-to-wishlist-button');

        await expect(wishlistButton).toBeVisible();

        await wishlistButton.click();
    }

    async verifyWishlistCount(expectedCount: number): Promise<void> {
        await expect(this.wishlistCount).toHaveText(
            `(${expectedCount})`
        );
    }

    async openWishlist(): Promise<void> {
        await this.wishlistLink.click();
    }
}