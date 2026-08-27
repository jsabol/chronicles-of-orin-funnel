import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFPage } from "pdf-lib"
import { ABILITIES, type Ability, type CharacterRecordV1, type DerivedCharacter, type PaperSize, type TraitDefinition } from "./types"
import { SKILLS } from "./data"
import { deriveCharacter, formatModifier } from "./domain"

export const PDF_PAGE_SIZES: Record<PaperSize, readonly [number, number]> = {
  letter: [612, 792],
  a4: [595.28, 841.89],
}

const ink = rgb(0, 0, 0)
const rust = rgb(0, 0, 0)
const paper = rgb(1, 1, 1)
const muted = rgb(0, 0, 0)
const rule = rgb(0, 0, 0)

const pdfSafe = (value: string): string => value
  .replace(/[\u2018\u2019]/g, "'")
  .replace(/[\u201c\u201d]/g, '"')
  .replace(/[\u2010-\u2015]/g, "-")
  .replace(/\u2026/g, "...")
  .replace(/[^\x20-\x7e]/g, "?")

const wrapText = (text: string, font: PDFFont, size: number, maxWidth: number): string[] => {
  const lines: string[] = []
  for (const paragraph of pdfSafe(text).split(/\n/)) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean)
    if (!words.length) { lines.push(""); continue }
    let line = ""
    for (const word of words) {
      const candidate = line ? line + " " + word : word
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) line = candidate
      else {
        if (line) lines.push(line)
        line = word
      }
    }
    if (line) lines.push(line)
  }
  return lines
}

const drawWrapped = (
  page: PDFPage, text: string, x: number, y: number, width: number,
  font: PDFFont, size: number, color = ink, lineHeight = size * 1.18, maxLines = 99,
): number => {
  const lines = wrapText(text, font, size, width).slice(0, maxLines)
  lines.forEach((line, i) => page.drawText(line, { x, y: y - i * lineHeight, size, font, color }))
  return y - lines.length * lineHeight
}

const drawFrame = (page: PDFPage, x: number, y: number, width: number, height: number, title: string, bold: PDFFont): void => {
  page.drawRectangle({ x, y, width, height, borderColor: ink, borderWidth: 0.75 })
  const label = pdfSafe(title.toUpperCase())
  const labelWidth = bold.widthOfTextAtSize(label, 7.2) + 8
  page.drawRectangle({ x: x + 6, y: y + height - 3, width: labelWidth, height: 9, color: paper })
  page.drawText(label, { x: x + 10, y: y + height - 1, size: 7.2, font: bold, color: ink })
}

const skillAbility: Record<string, Ability> = {
  "Acrobatics": "dex", "Animal Handling": "wis", "Arcana": "int", "Athletics": "str",
  "Deception": "cha", "History": "int", "Insight": "wis", "Intimidation": "cha",
  "Investigation": "int", "Medicine": "wis", "Nature": "int", "Perception": "wis",
  "Performance": "cha", "Persuasion": "cha", "Religion": "int", "Sleight of Hand": "dex",
  "Stealth": "dex", "Survival": "wis",
}

const foldedTraitIds = new Set([
  "tool", "skilled", "staying-power", "keen", "wild", "instinct",
  "fleet-stride", "tough-hide", "design", "menacing", "beast-legs",
])

interface Feature {
  name: string
  summary: string
}

const visibleAncestryFeatures = (character: DerivedCharacter): Feature[] => {
  const result: Feature[] = character.traits
    .filter((trait: TraitDefinition) => !foldedTraitIds.has(trait.id))
    .map((trait) => ({ name: trait.name, summary: trait.summary }))
  if (character.record.ancestryChoices.focus) result.push({ name: "Focus", summary: character.record.ancestryChoices.focus })
  if (character.record.ancestryChoices.runeTarget) result.push({ name: "Rune Target", summary: character.record.ancestryChoices.runeTarget })
  return result
}

const drawAbilityColumn = (
  page: PDFPage, character: DerivedCharacter, x: number, top: number, width: number,
  bottom: number, bold: PDFFont,
): void => {
  let y = top
  ABILITIES.forEach((ability) => {
    page.drawText(ability.toUpperCase(), { x, y: y - 1, size: 8, font: bold, color: ink })
    page.drawRectangle({ x: x + 21, y: y - 11, width: 27, height: 21, borderColor: ink, borderWidth: 0.7 })
    page.drawText(String(character.finalAbilities[ability]), { x: x + 27, y: y - 5, size: 13, font: bold, color: ink })
    page.drawEllipse({ x: x + 51, y: y - 1, xScale: 10, yScale: 8, borderColor: ink, borderWidth: 0.7, color: paper })
    const mod = formatModifier(character.modifiers[ability])
    page.drawText(mod, { x: x + 51 - bold.widthOfTextAtSize(mod, 8) / 2, y: y - 3.5, size: 8, font: bold, color: rust })
    y -= 31
  })

  const infoTop = Math.max(y - 1, bottom + 98)
  const rowHeight = 15
  const rows = [
    ["AC", String(character.armorClass)],
    ["SPEED", character.speed + " ft"],
    ["SIZE", character.size],
    ["HIT DICE", character.hitDice],
  ]
  rows.forEach(([label, value], i) => {
    const rowY = infoTop - i * rowHeight
    page.drawText(label!, { x, y: rowY, size: 7, font: bold, color: rust })
    page.drawText(pdfSafe(value!), { x: x + 35, y: rowY, size: 8, font: bold, color: ink })
    if (i < rows.length - 1) page.drawLine({ start: { x, y: rowY - 4 }, end: { x: x + width, y: rowY - 4 }, thickness: 0.3, color: rule })
  })
}

const drawHitPoints = (
  page: PDFPage, character: DerivedCharacter, x: number, y: number, width: number,
  height: number, regular: PDFFont, bold: PDFFont,
): void => {
  drawFrame(page, x, y, width, height, "Hit Points", bold)
  const splitY = y + 18
  page.drawLine({ start: { x, y: splitY }, end: { x: x + width, y: splitY }, thickness: 0.7, color: ink })
  page.drawLine({ start: { x: x + width / 2, y }, end: { x: x + width / 2, y: splitY }, thickness: 0.7, color: ink })
  page.drawText("CURRENT", { x: x + 7, y: splitY + 6, size: 5.5, font: bold, color: ink })
  const hp = String(character.maxHp)
  page.drawText("TEMP HP", { x: x + 6, y: y + 6, size: 5.2, font: regular, color: ink })
  page.drawText("MAX", { x: x + width / 2 + 6, y: y + 6, size: 5.2, font: regular, color: ink })
  page.drawText(hp, { x: x + width - 7 - bold.widthOfTextAtSize(hp, 9), y: y + 5, size: 9, font: bold, color: ink })
}

const drawDeathSaves = (
  page: PDFPage, x: number, y: number, width: number, height: number,
  regular: PDFFont, bold: PDFFont,
): void => {
  drawFrame(page, x, y, width, height, "Death Saves", bold)
  const splitX = x + width / 2
  page.drawLine({ start: { x: splitX, y }, end: { x: splitX, y: y + height - 3 }, thickness: 0.7, color: ink })

  const drawEmptyCircles = (startX: number): void => {
    ;[0, 1, 2].forEach((index) => page.drawCircle({
      x: startX + index * 15,
      y: y + height / 2 - 3,
      size: 4.4,
      borderColor: ink,
      borderWidth: 0.75,
      color: paper,
    }))
  }

  drawEmptyCircles(x + 13)
  drawEmptyCircles(splitX + 13)
  const failure = "FAILURES"
  page.drawText(failure, {
    x: splitX + (width / 2 - regular.widthOfTextAtSize(failure, 5.2)) / 2,
    y: y + 6,
    size: 5.2,
    font: regular,
    color: ink,
  })
}

const drawSkills = (
  page: PDFPage, character: DerivedCharacter, x: number, top: number, width: number,
  regular: PDFFont, bold: PDFFont,
): void => {
  let y = top
  for (const skill of SKILLS) {
    const ability = skillAbility[skill]!
    const proficient = character.proficiencies.includes(skill)
    const value = character.modifiers[ability] + (proficient ? character.proficiencyBonus : 0)
    page.drawCircle({ x: x + 3, y: y + 1.5, size: 2.6, borderColor: proficient ? rust : muted, borderWidth: 0.65, color: proficient ? ink : paper })
    page.drawText(pdfSafe(skill), { x: x + 9, y, size: 6.5, font: proficient ? bold : regular, color: ink })
    const suffix = "(" + ability.toUpperCase() + ")"
    const suffixWidth = regular.widthOfTextAtSize(suffix, 5)
    page.drawText(suffix, { x: x + width - 22 - suffixWidth, y: y + 0.4, size: 5, font: regular, color: muted })
    const score = (value >= 0 ? "+" : "") + value
    page.drawText(score, { x: x + width - bold.widthOfTextAtSize(score, 7), y, size: 7, font: bold, color: ink })
    y -= 13
  }
}

const drawFeatures = (
  page: PDFPage, features: Feature[], x: number, top: number, width: number,
  bottom: number, regular: PDFFont, bold: PDFFont,
): void => {
  let size = 6.5
  const estimate = (s: number) => features.reduce((sum, feature) =>
    sum + s * 1.15 + wrapText(feature.summary, regular, s, width).length * s * 1.13 + 3, 0)
  while (size > 5.2 && estimate(size) > top - bottom) size -= 0.2
  let y = top
  for (const feature of features) {
    if (y < bottom + size * 2) break
    page.drawText(pdfSafe(feature.name.toUpperCase()), { x, y, size: size, font: bold, color: rust })
    y -= size * 1.18
    const availableLines = Math.max(1, Math.floor((y - bottom) / (size * 1.13)))
    y = drawWrapped(page, feature.summary, x, y, width, regular, size, ink, size * 1.13, availableLines) - 3
  }
}

const drawItems = (
  page: PDFPage, character: DerivedCharacter, x: number, top: number, width: number,
  bottom: number, regular: PDFFont, bold: PDFFont,
): void => {
  const nonSkills = character.proficiencies.filter((item) => !SKILLS.some((skill) => skill === item))
  const sections: Feature[] = [
    { name: "Languages", summary: character.languages.join(", ") || "None" },
    { name: "Proficiencies", summary: nonSkills.join(", ") || "None" },
    { name: "Gear", summary: character.gear.join(", ") || "None" },
    { name: "Trinket", summary: character.trinket.text },
  ]
  if (character.magic.length) sections.push({ name: "Magic & Powers", summary: character.magic.join(" | ") })
  if (character.status === "deceased" && character.record.causeOfDeath) {
    sections.push({ name: "Cause of Death", summary: character.record.causeOfDeath })
  }
  drawFeatures(page, sections, x, top, width, bottom, regular, bold)
}

const drawCharacter = (
  page: PDFPage, character: DerivedCharacter, slot: 0 | 1,
  pageWidth: number, pageHeight: number, regular: PDFFont, bold: PDFFont,
): void => {
  const half = pageHeight / 2
  const slotBottom = slot === 0 ? half : 0
  const marginX = 14
  const cardBottom = slotBottom + 10
  const cardTop = slotBottom + half - 10
  const cardWidth = pageWidth - marginX * 2
  page.drawRectangle({ x: marginX, y: cardBottom, width: cardWidth, height: cardTop - cardBottom, borderColor: ink, borderWidth: 1 })

  const headerY = cardTop - 18
  const name = pdfSafe(character.record.name)
  let nameSize = 15
  while (nameSize > 10 && bold.widthOfTextAtSize(name, nameSize) > cardWidth * 0.47) nameSize -= 0.5
  page.drawText(name, { x: marginX + 10, y: headerY, size: nameSize, font: bold, color: ink })
  const identity = pdfSafe(character.ancestry.name + " / " + character.occupation.name + (character.status === "deceased" ? " / FALLEN" : ""))
  page.drawText(identity, { x: marginX + cardWidth - 10 - regular.widthOfTextAtSize(identity, 7.5), y: headerY + 1, size: 7.5, font: regular, color: character.status === "deceased" ? rust : muted })
  page.drawLine({ start: { x: marginX + 8, y: headerY - 7 }, end: { x: marginX + cardWidth - 8, y: headerY - 7 }, thickness: 0.65, color: rule })

  const contentTop = headerY - 20
  const contentBottom = cardBottom + 10
  const gap = 7
  const abilityWidth = 70
  const skillsWidth = 126
  const featuresWidth = Math.max(155, cardWidth * 0.32)
  const itemsWidth = cardWidth - 20 - abilityWidth - skillsWidth - featuresWidth - gap * 3
  const x1 = marginX + 10
  const x2 = x1 + abilityWidth + gap
  const x3 = x2 + skillsWidth + gap
  const x4 = x3 + featuresWidth + gap
  const frameY = contentBottom - 4
  const frameHeight = contentTop - contentBottom + 11

  const hpHeight = 52
  const hpY = contentTop + 7 - hpHeight
  const skillsFrameTop = hpY - 7
  const deathSavesHeight = 40
  const deathSavesY = frameY
  const recordFrameY = deathSavesY + deathSavesHeight + 7
  const recordFrameHeight = contentTop - recordFrameY + 7
  drawHitPoints(page, character, x2 - 4, hpY, skillsWidth + 8, hpHeight, regular, bold)
  drawFrame(page, x2 - 4, frameY, skillsWidth + 8, skillsFrameTop - frameY, "Skills / Proficient", bold)
  drawFrame(page, x3 - 4, frameY, featuresWidth + 8, frameHeight, "Ancestry Features", bold)
  drawFrame(page, x4 - 4, recordFrameY, itemsWidth + 8, recordFrameHeight, "Record", bold)
  drawDeathSaves(page, x4 - 4, deathSavesY, itemsWidth + 8, deathSavesHeight, regular, bold)
  drawAbilityColumn(page, character, x1, contentTop, abilityWidth, contentBottom, bold)
  drawSkills(page, character, x2, skillsFrameTop - 12, skillsWidth, regular, bold)
  drawFeatures(page, visibleAncestryFeatures(character), x3, contentTop, featuresWidth, contentBottom, regular, bold)
  drawItems(page, character, x4, contentTop, itemsWidth, recordFrameY + 5, regular, bold)

  if (character.status === "deceased") {
    const stamp = "FALLEN"
    page.drawText(stamp, {
      x: marginX + cardWidth / 2 - bold.widthOfTextAtSize(stamp, 25) / 2,
      y: slotBottom + half / 2 - 8,
      size: 25, font: bold, color: rust, rotate: degrees(-12), opacity: 0.12,
    })
  }
}

export const generatePdfBytes = async (records: CharacterRecordV1[], paperSize: PaperSize): Promise<Uint8Array> => {
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
      page.drawLine({ start: { x: 12, y: height / 2 }, end: { x: width - 12, y: height / 2 }, thickness: 0.5, dashArray: [4, 4], color: muted })
    }
    drawCharacter(pdf.getPages()[pdf.getPageCount() - 1]!, deriveCharacter(record), (index % 2) as 0 | 1, width, height, regular, bold)
  })
  return pdf.save()
}

export const downloadCharacterPdf = async (records: CharacterRecordV1[], paperSize: PaperSize): Promise<void> => {
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
