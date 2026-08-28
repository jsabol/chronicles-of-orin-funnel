import { expect, test } from "@playwright/test";

test("generate, persist, edit, delete, and enter print mode", async ({
  page,
}) => {
  await page.goto("/#/");
  await expect(page.getByRole("heading", { name: "The Doomed" })).toBeVisible();
  await page.getByRole("button", { name: /Roll 4 Wretches/ }).click();
  expect(
    await page.getByTestId("character-card").count(),
  ).toBeGreaterThanOrEqual(4);
  await page.reload();
  expect(
    await page.getByTestId("character-card").count(),
  ).toBeGreaterThanOrEqual(4);
  const firstName = await page
    .getByTestId("character-card")
    .locator("h3")
    .first()
    .textContent();
  await page.getByTestId("character-card").first().click();
  await expect(page).toHaveURL(/#\/characters\//);
  await page.locator(".choices").click();
  await expect(page.locator(".choices")).toHaveClass(/is-open/);
  await page.keyboard.press("Escape");
  const nameField = page.getByRole("textbox", { name: /^Name/ });
  await nameField.fill("Ash Under Noon");
  await nameField.press("Tab");
  await page.getByRole("link", { name: /Return to roster/ }).click();
  await expect(page.getByText("Ash Under Noon")).toBeVisible();
  await page.getByRole("button", { name: "Cast Them Into the Funnel" }).click();
  await page.getByTestId("character-card").first().click();
  await expect(page.locator("[data-select]").first()).toBeChecked();
  await page.getByRole("button", { name: "Prepare the Funnel" }).click();
  await expect(
    page.getByRole("heading", { name: "Choose paper size" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(firstName).toBeTruthy();
});

test("mobile roster remains usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/");
  await expect(
    page.getByRole("button", { name: /Roll 4 Wretches/ }),
  ).toBeVisible();
});
