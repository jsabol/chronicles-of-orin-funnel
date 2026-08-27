import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { createCharacter } from "./domain";
import { generatePdfBytes, PDF_PAGE_SIZES } from "./pdf";

describe("print output", () => {
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
  it("prints deceased records", async () => {
    const c = createCharacter("b");
    c.rawAbilities.con = 3;
    c.hpRoll = 1;
    const bytes = await generatePdfBytes([c], "letter");
    expect(bytes.byteLength).toBeGreaterThan(1000);
  });
});
