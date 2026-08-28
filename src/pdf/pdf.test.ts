import { PDFDocument } from "pdf-lib";
import { readFile } from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createCharacter } from "../domain";
import {
  formatGearForPdf,
  formatMagicForPdf,
  generatePdfBytes,
  PDF_PAGE_SIZES,
} from "./pdf";

beforeAll(async () => {
  const agencyFont = await readFile("public/AgencyFB Black Regular.otf");
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(agencyFont)),
  );
});

afterAll(() => vi.unstubAllGlobals());

describe("print output", () => {
  it("formats weapon gear like the character record", () => {
    expect(
      formatGearForPdf("Improvised Weapon [hit +5 | dmg 1d4+3 | thrown 20/60]"),
    ).toBe("Improvised Weapon. Attack: +5, thrown 20/60. Dmg: 1d4 + 3");
  });
  it("formats powers like the character record", () => {
    expect(formatMagicForPdf("Mind Lance - Strike with psychic force.")).toBe(
      "Mind Lance. Strike with psychic force.",
    );
  });
  it.each(["letter", "a4"] as const)(
    "creates two-up %s pages",
    async (paper) => {
      const chars = [
        createCharacter("b"),
        createCharacter("b"),
        createCharacter("b"),
      ];
      const pdf = await PDFDocument.load(await generatePdfBytes(chars, paper));
      expect(pdf.getPageCount()).toBe(2);
      expect([pdf.getPage(0).getWidth(), pdf.getPage(0).getHeight()]).toEqual([
        ...PDF_PAGE_SIZES[paper],
      ]);
    },
  );
  it("prints fallen records", async () => {
    const c = createCharacter("b");
    c.rawAbilities.con = 3;
    c.hpRoll = 1;
    const bytes = await generatePdfBytes([c], "letter");
    expect(bytes.byteLength).toBeGreaterThan(1000);
  });
});
