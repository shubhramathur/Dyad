import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';

import { RegisterPage } from '../pages/demoWebShop/RegisterPage';
import { SearchPage } from '../pages/demoWebShop/SearchPage';
import { WishlistPage } from '../pages/demoWebShop/WishlistPage';

test('Scenario 5: wishlist to cart validation', async ({ page }) => {
  const user = {
    firstName: 'QA',
    lastName: 'User',
    email: `qauser_${randomUUID()}@example.com`,
    password: `Qa@123_${randomUUID()}`,
  };

  const registerPage = new RegisterPage(page);
  const searchPage = new SearchPage(page);
  const wishlistPage = new WishlistPage(page);

  // Step 1: Register new user
  await registerPage.goto();
  await registerPage.register(user);

  // Validation 1: Registration successful
  await expect(registerPage.successMessage).toBeVisible();

  // Step 2: Search for Book
  await searchPage.searchProduct('Book');
  await searchPage.openBooksCategory();

  // Step 3: Add first 2 books to Wishlist
  const selectedProducts = [
    'Fiction EX',
    'Health Book'
  ];

  await searchPage.addBookToWishlist(selectedProducts[0]);

  await searchPage.verifyWishlistCount(1);

  await searchPage.openBooksCategory();

  await searchPage.addBookToWishlist(selectedProducts[1]);

  await searchPage.verifyWishlistCount(2);

  // Open Wishlist
  await searchPage.openWishlist();

  // Validation 2: Exactly 2 products in Wishlist
  await wishlistPage.verifyProductCount(2);

  // Additional validation:
  // Verify the selected products are present
  await wishlistPage.verifyProducts(selectedProducts);
});