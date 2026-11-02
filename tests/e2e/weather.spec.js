import { test, expect } from '@playwright/test';

const londonResponse = {
  name: 'London',
  sys: { country: 'GB' },
  weather: [{ main: 'Clouds', description: 'broken clouds', icon: '04n' }],
  main: { temp: 9.4, feels_like: 7.3, humidity: 89, pressure: 1036 },
  wind: { speed: 3.8 }
};

test('page loads and accepts input', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/');
  await page.fill('#cityInput', 'London');

  await expect(page.locator('#cityInput')).toHaveValue('London');
  expect(errors).toEqual([]);
});

test('searching for a city displays its weather', async ({ page }) => {
  await page.route('**/api/weather?city=London', (route) =>
    route.fulfill({ json: londonResponse })
  );

  await page.goto('/');
  await page.fill('#cityInput', 'London');
  await page.click('#searchBtn');

  await expect(page.locator('#weatherDisplay')).toBeVisible();
  await expect(page.locator('#cityName')).toContainText('London');
  await expect(page.locator('#humidity')).toContainText('89');
});

test('an unknown city shows an error message', async ({ page }) => {
  await page.route('**/api/weather?city=Nowhereville', (route) =>
    route.fulfill({ status: 404, json: { error: 'City not found. Please check the spelling and try again.' } })
  );

  await page.goto('/');
  await page.fill('#cityInput', 'Nowhereville');
  await page.click('#searchBtn');

  await expect(page.locator('#errorMessage')).toContainText('City not found');
});
