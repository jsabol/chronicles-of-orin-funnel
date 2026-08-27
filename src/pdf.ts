import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFPage } from "pdf-lib"
import { ABILITIES, type CharacterRecordV1, type DerivedCharacter, type PaperSize } from "./types"
import { deriveCharacter, formatModifier } from "./domain"

export const PDF_PAGE_SIZES: Record<PaperSize, readonly [number, number]> = {
  letter: [612, 792],
  a4: [595.28, 841.89],
}

const ink = rgb(0.025, 0.02, 0.015)
const rust = rgb(0.34, 0.07, 0.035)
const sand = rgb(0.99, 0.975, 0.93)
const muted = rgb(0.12, 0.095, 0.07)

const pdfSafe = (value: string): string => value
  .replace(/[`']/g, "'")
  .replace(/[""]/g, '"')
  .replace(/[--]/g, "-")
  .replace(/./g, "...")
  .replace(/[^ -~�-�]/g, "?")

const wrapText = (text: string, font: PDFFont, size: number, maxWidth: number): string[] => {
  const paragraphs = pdfSafe(text).split(/\n/)
  const lines: string[] = []
  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean)
    if (!words.length) {
      lines.push("")
      continue
    }
    let line = ""
    for (const word of words) {
      const candidate = line ? line + " " + word : word
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate
      } else if (line) {
        lines.push(line)
        line = word
      } else {
        lines.push(word)
      }
    }
    if (line) lines.push(line)
  }
  return lines
}

const drawWrapped = (
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  font: PDFFont,
  size: number,
  lineHeight = size * 1.22,
  maxLines = 99,
): number => {
  const lines = wrapText(text, font, size, maxWidth).slice(0, maxLines)
  lines.forEach((line, index) => page.drawText(line, { x, y: y - index * lineHeight, size, font, color: ink }))
  return y - lines.length * lineHeight
}

interface Section {
  title: string
  text: string
}

const drawSections = (
  page: PDFPage,
  sections: Section[],
  x: number,
  startY: number,
  width: number,
  bottom: number,
  regular: PDFFont,
  bold: PDFFont,
): void => {
  let size = 7.2
  const estimateLines = (candidateSize: number): number => sections.reduce((count, section) =>
    count + 1 + wrapText(section.text, regular, candidateSize, width).length, 0)
  const available = startY - bottom
  while (size > 6.2 && estimateLines(size) * size * 1.28 > available) size -= 0.2

  let y = startY
  for (const section of sections) {
    if (!section.text.trim() || y < bottom + size * 2) continue
    page.drawText(pdfSafe(section.title.toUpperCase()), { x, y, size: size + 0.4, font: bold, color: rust })
    y -= size * 1.25
    const maxLines = Math.max(1, Math.floor((y - bottom) / (size * 1.22)))
    y = drawWrapped(page, section.text, x, y, width, regular, size, size * 1.22, maxLines) - size * 0.45
  }
}

const characterSections = (character: DerivedCharacter): { left: Section[]; right: Section[] } => {
  const trinket = character.trinket.text +
    (character.record.trinketAnswer ? " " + character.record.trinketAnswer : "")
  const left: Section[] = [
    { title: "Gear", text: character.gear.join(", ") || "None" },
    { title: "Proficiencies", text: character.proficiencies.join(", ") || "None" },
    { title: "Magic & Powers", text: character.magic.join(" | ") || "None" },
    { title: "Trinket", text: trinket },
  ]
  const right: Section[] = [
    {
      title: "Ancestry Traits",
      text: character.traits.map((item) => item.name + ": " + item.summary).join(" | "),
    },
  ]
  if (character.record.ancestryChoices.focus) {
    right.push({ title: "Focus", text: character.record.ancestryChoices.focus })
  }
  if (character.record.ancestryChoices.runeTarget) {
    right.push({ title: "Rune Target", text: character.record.ancestryChoices.runeTarget })
  }
  return { left, right }
}

const drawCharacter = (
  page: PDFPage,
  character: DerivedCharacter,
  slot: 0 | 1,
  pageWidth: number,
  pageHeight: number,
  regular: PDFFont,
  bold: PDFFont,
): void => {
  const half = pageHeight / 2
  const slotBottom = slot === 0 ? half : 0
  const marginX = 20
  const cardBottom = slotBottom + 12
  const cardTop = slotBottom + half - 12
  const cardWidth = pageWidth - marginX * 2
  page.drawRectangle({
    x: marginX,
    y: cardBottom,
    width: cardWidth,
    height: cardTop - cardBottom,
    color: sand,
    borderColor: rust,
    borderWidth: 1.25,
  })

  const x = marginX + 13
  let y = cardTop - 23
  const name = pdfSafe(character.record.name)
  let nameSize = 16
  while (nameSize > 10 && bold.widthOfTextAtSize(name, nameSize) > cardWidth * 0.55) nameSize -= 0.5
  page.drawText(name, { x, y, size: nameSize, font: bold, color: ink })
  const subtitle = pdfSafe(character.ancestry.name + " / " + character.occupation.name)
  const subtitleWidth = regular.widthOfTextAtSize(subtitle, 8.5)
  page.drawText(subtitle, {
    x: marginX + cardWidth - 13 - subtitleWidth,
    y: y + 2,
    size: 8.5,
    font: regular,
    color: muted,
  })
  y -= 30

  const statGap = 5
  const statWidth = (cardWidth - 26 - statGap * 5) / 6
  ABILITIES.forEach((ability, index) => {
    const statX = x + index * (statWidth + statGap)
    page.drawRectangle({ x: statX, y: y - 20, width: statWidth, height: 25, borderColor: muted, borderWidth: 0.6 })
    page.drawText(ability.toUpperCase(), { x: statX + 4, y: y - 4, size: 6.2, font: bold, color: rust })
    const value = String(character.finalAbilities[ability]) + " " + formatModifier(character.modifiers[ability])
    page.drawText(value, { x: statX + 4, y: y - 15, size: 9, font: bold, color: ink })
  })
  y -= 36

  const vitals = [
    "HP " + character.maxHp,
    "AC " + character.armorClass,
    "PB +2",
    "HIT DICE " + character.hitDice,
    "SPEED " + character.speed + " ft.",
    character.size.toUpperCase(),
  ]
  page.drawText(pdfSafe(vitals.join("     ")), { x, y, size: 7.8, font: bold, color: ink })
  y -= 14
  page.drawText(pdfSafe("LANGUAGES  " + character.languages.join(", ")), { x, y, size: 7, font: regular, color: muted })
  y -= 17

  const columns = characterSections(character)
  const columnGap = 14
  const columnWidth = (cardWidth - 26 - columnGap) / 2
  drawSections(page, columns.left, x, y, columnWidth, cardBottom + 12, regular, bold)
  drawSections(page, columns.right, x + columnWidth + columnGap, y, columnWidth, cardBottom + 12, regular, bold)

  if (character.status === "deceased") {
    const stamp = "DECEASED"
    page.drawText(stamp, {
      x: marginX + cardWidth / 2 - bold.widthOfTextAtSize(stamp, 28) / 2,
      y: slotBottom + half / 2 - 8,
      size: 28,
      font: bold,
      color: rgb(0.65, 0.08, 0.04),
      rotate: degrees(-12),
      opacity: 0.3,
    })
  }
}

export const generatePdfBytes = async (
  records: CharacterRecordV1[],
  paperSize: PaperSize,
): Promise<Uint8Array> => {
  const pdf = await PDFDocument.create()
  pdf.setTitle("Chronicles of Orrin Level-Zero Funnel")
  pdf.setSubject("Printable level-zero funnel characters")
  pdf.setCreator("Chronicles of Orrin Funnel")
  const regular = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const [width, height] = PDF_PAGE_SIZES[paperSize]

  records.forEach((record, index) => {
    if (index % 2 === 0) {
      const page = pdf.addPage([width, height])
      page.drawLine({
        start: { x: 14, y: height / 2 },
        end: { x: width - 14, y: height / 2 },
        thickness: 0.5,
        dashArray: [4, 4],
        color: muted,
      })
    }
    const page = pdf.getPages()[pdf.getPageCount() - 1]
    drawCharacter(page, deriveCharacter(record), (index % 2) as 0 | 1, width, height, regular, bold)
  })
  return pdf.save()
}

export const downloadCharacterPdf = async (
  records: CharacterRecordV1[],
  paperSize: PaperSize,
): Promise<void> => {
  const bytes = await generatePdfBytes(records, paperSize)
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = "orrin-funnel-" + new Date().toISOString().slice(0, 10) + ".pdf"
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
