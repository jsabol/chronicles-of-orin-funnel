import { expect, test } from "@playwright/test"

test("generate, persist, edit, delete, and enter print mode", async ({ page }) => {
  await page.goto("/#/")
  await expect(page.getByRole("heading", { name: "The Doomed" })).toBeVisible()
  await page.getByRole("button", { name: /Roll Four Wretches/ }).click()
  expect(await page.locator(".character-card").count()).toBeGreaterThanOrEqual(4)
  await page.reload()
  expect(await page.locator(".character-card").count()).toBeGreaterThanOrEqual(4)
  const firstName = await page.locator(".character-card h3").first().textContent()
  await page.locator(".character-card").first().click()
  await expect(page).toHaveURL(/#\/characters\//)
  await page.getByLabel("Name").fill("Ash Under Noon")
  await page.getByRole("button", { name: "Save Character" }).click()
  await expect(page.getByText("Ash Under Noon")).toBeVisible()
  await page.getByRole("button", { name: "Cast Them Into the Funnel" }).click()
  await page.locator("[data-select]").first().check()
  await page.getByRole("button", { name: "Prepare the Funnel" }).click()
  await expect(page.getByRole("heading", { name: "Choose paper size" })).toBeVisible()
  await page.getByRole("button", { name: "Cancel", exact: true }).click()
  expect(firstName).toBeTruthy()
})

test("mobile roster remains usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/#/")
  await expect(page.getByRole("button", { name: /Roll Four Wretches/ })).toBeVisible()
})
