import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import {
  ABILITIES,
  type Ability,
  type CharacterRecordV1,
  type DerivedCharacter,
  type PaperSize,
  type TraitDefinition,
} from "../types";
import { SKILLS } from "../data";
import { deriveCharacter, formatModifier } from "../domain";
import { PDF_FONT_SIZES, PDF_SPACING } from "./pdf-variables";

export const PDF_PAGE_SIZES: Record<PaperSize, readonly [number, number]> = {
  letter: [612, 792],
  a4: [595.28, 841.89],
};

const ink = rgb(0, 0, 0);
const rust = rgb(0, 0, 0);
const paper = rgb(1, 1, 1);
const muted = rgb(0, 0, 0);
const rule = rgb(0, 0, 0);

let agencyFontBytes: Promise<ArrayBuffer> | undefined;

const loadAgencyFont = (): Promise<ArrayBuffer> => {
  agencyFontBytes ??= fetch(
    `${import.meta.env.BASE_URL}AgencyFB Black Regular.otf`,
  ).then(async (response) => {
    if (!response.ok)
      throw new Error("Unable to load the embedded AgencyFB PDF font.");
    return response.arrayBuffer();
  });
  return agencyFontBytes;
};

const pdfSafe = (value: string): string =>
  value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[^\x20-\x7e]/g, "?");

const wrapText = (
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] => {
  const lines: string[] = [];
  for (const paragraph of text.split(/\n/)) {
    const words = pdfSafe(paragraph).trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of words) {
      const candidate = line ? line + " " + word : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) line = candidate;
      else {
        if (line) lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
};

const drawWrapped = (
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  width: number,
  font: PDFFont,
  size: number,
  color = ink,
  lineHeight = size * 1.18,
  maxLines = 99,
): number => {
  const lines = wrapText(text, font, size, width).slice(0, maxLines);
  lines.forEach((line, i) =>
    page.drawText(line, { x, y: y - i * lineHeight, size, font, color }),
  );
  return y - lines.length * lineHeight;
};

const drawFrame = (
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  bold: PDFFont,
  labelSize: number = PDF_FONT_SIZES.frameLabel,
): void => {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    borderColor: ink,
    borderWidth: 0.75,
  });
  const label = pdfSafe(title.toUpperCase());
  const labelWidth = bold.widthOfTextAtSize(label, labelSize) + 8;
  page.drawRectangle({
    x: x + 6,
    y: y + height - 3,
    width: labelWidth,
    height: 9,
    color: paper,
  });
  page.drawText(label, {
    x: x + 10,
    y: y + height - 1,
    size: labelSize,
    font: bold,
    color: ink,
  });
};

const skillAbility: Record<string, Ability> = {
  Acrobatics: "dex",
  "Animal Handling": "wis",
  Arcana: "int",
  Athletics: "str",
  Deception: "cha",
  History: "int",
  Insight: "wis",
  Intimidation: "cha",
  Investigation: "int",
  Medicine: "wis",
  Nature: "int",
  Perception: "wis",
  Performance: "cha",
  Persuasion: "cha",
  Religion: "int",
  "Sleight of Hand": "dex",
  Stealth: "dex",
  Survival: "wis",
};

const foldedTraitIds = new Set([
  "tool",
  "skilled",
  "staying-power",
  "keen",
  "wild",
  "instinct",
  "fleet-stride",
  "tough-hide",
  "design",
  "menacing",
  "beast-legs",
]);

interface Feature {
  name: string;
  summary: string;
}

const visibleAncestryFeatures = (character: DerivedCharacter): Feature[] => {
  const result: Feature[] = character.traits
    .filter((trait: TraitDefinition) => !foldedTraitIds.has(trait.id))
    .map((trait) => ({ name: trait.name, summary: trait.summary }));
  if (character.record.ancestryChoices.focus)
    result.push({
      name: "Focus",
      summary: character.record.ancestryChoices.focus,
    });
  if (character.record.ancestryChoices.runeTarget)
    result.push({
      name: "Rune Target",
      summary: character.record.ancestryChoices.runeTarget,
    });
  return result;
};

export const formatGearForPdf = (item: string): string => {
  const weapon = item.match(
    /^(.*?) \[hit ([^|]+) \| dmg ([^|]+)(?: \| (.+))?\]$/,
  );
  if (!weapon) return item;

  const [, name, attack, damage, properties] = weapon;
  const formattedDamage = damage.replace(/([+-])(\d+)/, " $1 $2");
  return `${name}. Attack: ${attack}${properties ? `, ${properties}` : ""}. Dmg: ${formattedDamage}`;
};

export const formatMagicForPdf = (item: string): string => {
  const power = item.match(/^(.+?) - (.+)$/);
  return power ? `${power[1]}. ${power[2]}` : item;
};

const drawAbilityColumn = (
  page: PDFPage,
  character: DerivedCharacter,
  x: number,
  top: number,
  width: number,
  bottom: number,
  regular: PDFFont,
  bold: PDFFont,
): number => {
  page.drawText("SAVES", {
    x:
      x +
      PDF_SPACING.savingThrowColumnOffset +
      PDF_SPACING.savingThrowLabelHorizontalOffset,
    y: top,
    size: PDF_FONT_SIZES.savingThrowLabel,
    font: bold,
    color: rust,
  });
  let y = top - PDF_SPACING.savingThrowHeaderToFirstRow;
  ABILITIES.forEach((ability) => {
    page.drawText(ability.toUpperCase(), {
      x: x + PDF_SPACING.abilityLabelHorizontalOffset,
      y: y - PDF_SPACING.abilityLabelBaselineOffset,
      size: PDF_FONT_SIZES.abilityLabel,
      font: bold,
      color: ink,
    });
    page.drawRectangle({
      x: x + PDF_SPACING.abilityScoreBoxOffset,
      y: y - 11,
      width: 27,
      height: 21,
      borderColor: ink,
      borderWidth: 0.7,
    });
    const mod = formatModifier(character.modifiers[ability]);
    page.drawText(mod, {
      x:
        x +
        PDF_SPACING.abilityScoreBoxOffset +
        13.5 -
        bold.widthOfTextAtSize(mod, PDF_FONT_SIZES.abilityModifier) / 2,
      y: y - 5,
      size: PDF_FONT_SIZES.abilityModifier,
      font: bold,
      color: rust,
    });
    page.drawEllipse({
      x: x + PDF_SPACING.abilityModifierOffset,
      y: y - 1,
      xScale: 10,
      yScale: 8,
      borderColor: ink,
      borderWidth: 0.7,
      color: paper,
    });
    const score = String(character.finalAbilities[ability]);
    page.drawText(score, {
      x:
        x +
        PDF_SPACING.abilityModifierOffset -
        bold.widthOfTextAtSize(score, PDF_FONT_SIZES.abilityScore) / 2,
      y: y - 3.5,
      size: PDF_FONT_SIZES.abilityScore,
      font: bold,
      color: ink,
    });
    const savingThrow = character.savingThrows[ability];
    const save = formatModifier(savingThrow.bonus);
    page.drawCircle({
      x:
        x +
        PDF_SPACING.savingThrowColumnOffset +
        PDF_SPACING.savingThrowMarkerOffset,
      y: y + PDF_SPACING.savingThrowMarkerBaselineOffset,
      size: PDF_SPACING.savingThrowMarkerSize,
      borderColor: savingThrow.proficient ? rust : muted,
      borderWidth: PDF_SPACING.savingThrowMarkerBorderWidth,
      color: savingThrow.proficient ? ink : paper,
    });
    page.drawText(save, {
      x:
        x +
        PDF_SPACING.savingThrowColumnOffset +
        PDF_SPACING.savingThrowValueOffset,
      y: y - PDF_SPACING.savingThrowValueBaselineOffset,
      size: PDF_FONT_SIZES.savingThrowValue,
      font: savingThrow.proficient ? bold : regular,
      color: ink,
    });
    y -= PDF_SPACING.abilityRowHeight;
  });

  const infoTop = Math.max(y - 1, bottom + 98);
  const rowHeight = 15;
  const rows = [
    ["Speed", character.speed + " ft"],
    ["Size", character.size],
  ];
  rows.forEach(([label, value], i) => {
    const rowY = infoTop - i * rowHeight;
    page.drawText(label!, {
      x,
      y: rowY,
      size: PDF_FONT_SIZES.statLabel,
      font: regular,
      color: rust,
    });
    page.drawText(pdfSafe(value!), {
      x: x + 35,
      y: rowY,
      size: PDF_FONT_SIZES.statValue,
      font: regular,
      color: ink,
    });
    if (i < rows.length - 1)
      page.drawLine({
        start: { x, y: rowY - 4 },
        end: { x: x + width, y: rowY - 4 },
        thickness: 0.3,
        color: rule,
      });
  });
  return infoTop - rows.length * rowHeight - PDF_SPACING.statBoxGap;
};

const drawStatBox = (
  page: PDFPage,
  title: string,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
  regular: PDFFont,
  bold: PDFFont,
  labelSize: number,
  valueSize: number,
): void => {
  drawFrame(page, x, y, width, height, title, bold, labelSize);
  page.drawText(value, {
    x: x + (width - regular.widthOfTextAtSize(value, valueSize)) / 2,
    y: y + (height - valueSize) / 2 + 2,
    size: valueSize,
    font: regular,
    color: ink,
  });
};

const drawHitPoints = (
  page: PDFPage,
  character: DerivedCharacter,
  x: number,
  y: number,
  width: number,
  height: number,
  regular: PDFFont,
  bold: PDFFont,
): void => {
  drawFrame(page, x, y, width, height, "Hit Points", bold);
  const splitY = y + 18;
  page.drawLine({
    start: { x, y: splitY },
    end: { x: x + width, y: splitY },
    thickness: 0.7,
    color: ink,
  });
  page.drawLine({
    start: { x: x + width / 2, y },
    end: { x: x + width / 2, y: splitY },
    thickness: 0.7,
    color: ink,
  });
  page.drawText("CURRENT", {
    x: x + 7,
    y: splitY + 6,
    size: PDF_FONT_SIZES.hitPointCurrent,
    font: bold,
    color: ink,
  });
  const hp = String(character.maxHp);
  page.drawText("TEMP", {
    x: x + 6,
    y: y + 6,
    size: PDF_FONT_SIZES.hitPointLabel,
    font: regular,
    color: ink,
  });
  page.drawText("MAX", {
    x: x + width / 2 + 6,
    y: y + 6,
    size: PDF_FONT_SIZES.hitPointLabel,
    font: regular,
    color: ink,
  });
  page.drawText(hp, {
    x:
      x +
      width -
      7 -
      bold.widthOfTextAtSize(hp, PDF_FONT_SIZES.hitPointMaximum),
    y: y + 5,
    size: PDF_FONT_SIZES.hitPointMaximum,
    font: bold,
    color: ink,
  });
};

const drawDeathSaves = (
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  fallen: boolean,
  regular: PDFFont,
  bold: PDFFont,
): void => {
  drawFrame(page, x, y, width, height, "Death Saves", bold);
  if (fallen) {
    const label = "FALLEN";
    page.drawText(label, {
      x:
        x +
        (width - bold.widthOfTextAtSize(label, PDF_FONT_SIZES.fallenStamp)) / 2,
      y: y + (height - PDF_FONT_SIZES.fallenStamp) / 2 + 3,
      size: PDF_FONT_SIZES.fallenStamp,
      font: bold,
      color: ink,
    });
    return;
  }
  const splitX = x + width / 2;
  page.drawLine({
    start: { x: splitX, y },
    end: { x: splitX, y: y + height - 3 },
    thickness: 0.7,
    color: ink,
  });

  const circleRadius = 8.8;
  const circleGap = 4;
  const groupWidth = circleRadius * 6 + circleGap * 2;
  const drawEmptyCircles = (boxX: number): void => {
    const startX = boxX + (width / 2 - groupWidth) / 2 + circleRadius;
    [0, 1, 2].forEach((index) =>
      page.drawCircle({
        x: startX + index * (circleRadius * 2 + circleGap),
        y: y + height / 2,
        size: circleRadius,
        borderColor: ink,
        borderWidth: 0.75,
        color: paper,
      }),
    );
  };

  drawEmptyCircles(x);
  drawEmptyCircles(splitX);
  const failure = "FAILURES";
  page.drawText(failure, {
    x:
      splitX +
      (width / 2 -
        regular.widthOfTextAtSize(failure, PDF_FONT_SIZES.deathSaveLabel)) /
        2,
    y: y + 6,
    size: PDF_FONT_SIZES.deathSaveLabel,
    font: regular,
    color: ink,
  });
};

const drawSkills = (
  page: PDFPage,
  character: DerivedCharacter,
  x: number,
  top: number,
  width: number,
  regular: PDFFont,
  bold: PDFFont,
): void => {
  let y = top;
  for (const [index, skill] of SKILLS.entries()) {
    const ability = skillAbility[skill]!;
    const proficient = character.proficiencies.includes(skill);
    const value =
      character.modifiers[ability] +
      (proficient ? character.proficiencyBonus : 0);
    page.drawCircle({
      x: x + 3,
      y: y + PDF_SPACING.skillMarkerBaselineOffset,
      size: 2.6,
      borderColor: proficient ? rust : muted,
      borderWidth: 0.65,
      color: proficient ? ink : paper,
    });
    page.drawText(pdfSafe(skill), {
      x: x + 9,
      y,
      size: PDF_FONT_SIZES.skillName,
      font: proficient ? bold : regular,
      color: ink,
    });
    const suffix = ability.toUpperCase();
    const suffixWidth = regular.widthOfTextAtSize(
      suffix,
      PDF_FONT_SIZES.skillAbility,
    );
    const score = (value >= 0 ? "+" : "") + value;
    const scoreWidth = bold.widthOfTextAtSize(score, PDF_FONT_SIZES.skillScore);
    const suffixCenter = x + width - PDF_SPACING.skillAbilityColumnWidth / 2;
    const scoreCenter =
      suffixCenter -
      PDF_SPACING.skillAbilityColumnWidth / 2 -
      PDF_SPACING.skillColumnGap -
      PDF_SPACING.skillBonusColumnWidth / 2;
    page.drawText(suffix, {
      x: suffixCenter - suffixWidth / 2,
      y,
      size: PDF_FONT_SIZES.skillAbility,
      font: regular,
      color: muted,
    });
    page.drawText(score, {
      x: scoreCenter - scoreWidth / 2,
      y,
      size: PDF_FONT_SIZES.skillScore,
      font: bold,
      color: ink,
    });
    if (index < SKILLS.length - 1) {
      page.drawLine({
        start: { x, y: y - PDF_SPACING.skillDividerOffset },
        end: { x: x + width, y: y - PDF_SPACING.skillDividerOffset },
        thickness: PDF_SPACING.skillDividerThickness,
        dashArray: [
          PDF_SPACING.skillDividerDashLength,
          PDF_SPACING.skillDividerDashGap,
        ],
        color: rule,
      });
    }
    y -= PDF_SPACING.skillRowHeight;
  }
};

const drawFeatures = (
  page: PDFPage,
  features: Feature[],
  x: number,
  top: number,
  width: number,
  bottom: number,
  regular: PDFFont,
  bold: PDFFont,
  italic?: PDFFont,
): void => {
  let size = PDF_FONT_SIZES.featureDefault;
  const estimate = (s: number) =>
    features.reduce(
      (sum, feature) =>
        sum +
        s * 1.15 +
        wrapText(feature.summary, regular, s, width).length * s * 1.13 +
        3,
      0,
    );
  while (size > PDF_FONT_SIZES.featureMinimum && estimate(size) > top - bottom)
    size -= 0.2;
  let y = top;
  for (const feature of features) {
    if (y < bottom + size * 2) break;
    if (feature.name === "ANCESTRY") {
      page.drawText(feature.name, {
        x,
        y,
        size,
        font: bold,
        color: rust,
      });
      y -= size * 1.18;
      continue;
    }
    if (feature.name === "Magic & Powers" && italic) {
      page.drawText(pdfSafe(feature.name.toUpperCase()), {
        x,
        y,
        size,
        font: bold,
        color: rust,
      });
      y -= size * 1.18;
      y = drawMagicSummary(
        page,
        feature.summary,
        x,
        y,
        width,
        bottom,
        regular,
        bold,
        italic,
        size,
      );
      continue;
    }
    if (feature.name === "Gear" && italic) {
      page.drawText(pdfSafe(feature.name.toUpperCase()), {
        x,
        y,
        size,
        font: bold,
        color: rust,
      });
      y -= size * 1.18;
      y = drawGearSummary(
        page,
        feature.summary,
        x,
        y,
        width,
        bottom,
        regular,
        italic,
        size,
      );
      continue;
    }
    y =
      drawInlineSegments(
        page,
        [
          { text: `${feature.name}.`, font: italic ?? bold },
          { text: feature.summary, font: regular },
        ],
        x,
        y,
        width,
        size,
      ) - PDF_SPACING.featureSectionGap;
    continue;
  }
};

type TextSegment = { text: string; font: PDFFont };

const drawInlineSegments = (
  page: PDFPage,
  segments: TextSegment[],
  x: number,
  y: number,
  width: number,
  size: number,
): number => {
  let cursor = x;
  let hasText = false;
  const lineHeight = size * 1.13;
  for (const segment of segments) {
    for (const word of pdfSafe(segment.text).split(/\s+/).filter(Boolean)) {
      const prefix = hasText ? " " : "";
      const token = `${prefix}${word}`;
      const tokenWidth = segment.font.widthOfTextAtSize(token, size);
      if (hasText && cursor + tokenWidth > x + width) {
        y -= lineHeight;
        cursor = x;
        hasText = false;
      }
      const text = hasText ? token : word;
      page.drawText(text, {
        x: cursor,
        y,
        size,
        font: segment.font,
        color: ink,
      });
      cursor += segment.font.widthOfTextAtSize(text, size);
      hasText = true;
    }
  }
  return y - lineHeight;
};

const drawGearSummary = (
  page: PDFPage,
  summary: string,
  x: number,
  y: number,
  width: number,
  bottom: number,
  regular: PDFFont,
  italic: PDFFont,
  size: number,
): number => {
  for (const item of summary.split("\n")) {
    if (y < bottom + size * 2) break;
    const namedItem = item.match(/^(.+?\.)(?:\s+(.*))?$/);
    y = drawInlineSegments(
      page,
      namedItem
        ? [
            { text: namedItem[1], font: italic },
            { text: namedItem[2] ?? "", font: regular },
          ]
        : [{ text: item, font: regular }],
      x,
      y,
      width,
      size,
    );
  }
  return y - PDF_SPACING.featureSectionGap;
};

const drawMagicSummary = (
  page: PDFPage,
  summary: string,
  x: number,
  y: number,
  width: number,
  bottom: number,
  regular: PDFFont,
  _bold: PDFFont,
  italic: PDFFont,
  size: number,
): number => {
  for (const item of summary.split("\n")) {
    if (y < bottom + size * 2) break;
    const spell = item.match(
      /^(.+?)\. Casting Time: (.+?)\. Range: (.+?)\. Duration: (.+?)\. (.+)$/,
    );
    const power = item.match(/^(.+?)\. (.+)$/);
    if (spell) {
      const [, name, castingTime, range, duration, description] = spell;
      y =
        drawInlineSegments(
          page,
          [
            { text: `${name}.`, font: italic },
            { text: "Casting Time:", font: italic },
            { text: `${castingTime}.`, font: regular },
            { text: "Range:", font: italic },
            { text: `${range}.`, font: regular },
            { text: "Duration:", font: italic },
            { text: `${duration}.`, font: regular },
            { text: description, font: regular },
          ],
          x,
          y,
          width,
          size,
        ) - PDF_SPACING.featureSectionGap;
    } else if (power) {
      y =
        drawInlineSegments(
          page,
          [
            { text: `${power[1]}.`, font: italic },
            { text: power[2], font: regular },
          ],
          x,
          y,
          width,
          size,
        ) - PDF_SPACING.featureSectionGap;
    } else {
      y =
        drawWrapped(page, item, x, y, width, regular, size, ink) -
        PDF_SPACING.featureSectionGap;
    }
  }
  return y;
};

const drawItems = (
  page: PDFPage,
  character: DerivedCharacter,
  x: number,
  top: number,
  width: number,
  bottom: number,
  regular: PDFFont,
  bold: PDFFont,
  italic: PDFFont,
): void => {
  const nonSkills = character.proficiencies.filter(
    (item) => !SKILLS.some((skill) => skill === item),
  );
  const sections: Feature[] = [
    { name: "Languages", summary: character.languages.join(", ") || "None" },
    { name: "Proficiencies", summary: nonSkills.join(", ") || "None" },
    { name: "Trinket", summary: character.trinket.text },
    {
      name: "Gear",
      summary: character.gear.map(formatGearForPdf).join("\n") || "None",
    },
  ];
  if (character.status === "fallen" && character.record.causeOfDeath) {
    sections.push({
      name: "Cause of Death",
      summary: character.record.causeOfDeath,
    });
  }
  drawFeatures(page, sections, x, top, width, bottom, regular, bold, italic);
};

const drawCharacter = (
  page: PDFPage,
  character: DerivedCharacter,
  slot: 0 | 1,
  pageWidth: number,
  pageHeight: number,
  regular: PDFFont,
  bold: PDFFont,
  italic: PDFFont,
  nameFont: PDFFont,
): void => {
  const half = pageHeight / 2;
  const slotBottom = slot === 0 ? half : 0;
  const marginX = 14;
  const cardBottom = slotBottom + 10;
  const cardTop = slotBottom + half - 10;
  const cardWidth = pageWidth - marginX * 2;
  page.drawRectangle({
    x: marginX,
    y: cardBottom,
    width: cardWidth,
    height: cardTop - cardBottom,
    borderColor: ink,
    borderWidth: 1,
  });

  const headerY = cardTop - PDF_SPACING.headerTopOffset;
  const name = pdfSafe(character.record.name.toUpperCase());
  let nameSize = PDF_FONT_SIZES.characterNameStart;
  while (
    nameSize > PDF_FONT_SIZES.characterNameMinimum &&
    nameFont.widthOfTextAtSize(name, nameSize) > cardWidth * 0.47
  )
    nameSize -= PDF_FONT_SIZES.characterNameStep;
  page.drawText(name, {
    x: marginX + 10,
    y: headerY,
    size: nameSize,
    font: nameFont,
    color: ink,
  });
  const identity = pdfSafe(
    character.ancestry.name +
      " / " +
      character.occupation.name +
      (character.status === "fallen" ? " / FALLEN" : ""),
  );
  page.drawText(identity, {
    x:
      marginX +
      cardWidth -
      10 -
      regular.widthOfTextAtSize(identity, PDF_FONT_SIZES.characterIdentity),
    y: headerY + 1,
    size: PDF_FONT_SIZES.characterIdentity,
    font: regular,
    color: character.status === "fallen" ? rust : muted,
  });
  page.drawLine({
    start: { x: marginX + 8, y: headerY - PDF_SPACING.headerDividerOffset },
    end: {
      x: marginX + cardWidth - 8,
      y: headerY - PDF_SPACING.headerDividerOffset,
    },
    thickness: 0.65,
    color: rule,
  });

  const contentTop = headerY - PDF_SPACING.headerContentOffset;
  const contentBottom = cardBottom + 10;
  const gap = PDF_SPACING.frameGap;
  const abilityWidth = PDF_SPACING.abilityColumnWidth;
  const skillsWidth = 126;
  const featuresWidth =
    (cardWidth - 20 - abilityWidth - skillsWidth - gap * 3) / 2;
  const itemsWidth = featuresWidth;
  const x1 = marginX + 10;
  const x2 = x1 + abilityWidth + gap;
  const x3 = x2 + skillsWidth + gap;
  const x4 = x3 + featuresWidth + gap;
  const frameY = contentBottom - 4;
  const frameHeight =
    contentTop - contentBottom + PDF_SPACING.frameContentTop + 4;

  const hpHeight = 52;
  const hpY = contentTop + PDF_SPACING.frameContentTop - hpHeight;
  const skillsFrameTop = hpY - gap;
  const deathSavesHeight = 40;
  const deathSavesY = frameY;
  const recordFrameY = deathSavesY + deathSavesHeight + gap;
  const recordFrameHeight =
    contentTop - recordFrameY + PDF_SPACING.frameContentTop;
  drawHitPoints(
    page,
    character,
    x2 - 4,
    hpY,
    skillsWidth + 8,
    hpHeight,
    regular,
    bold,
  );
  drawFrame(
    page,
    x2 - 4,
    frameY,
    skillsWidth + 8,
    skillsFrameTop - frameY,
    "Skills",
    bold,
  );
  drawFrame(
    page,
    x3 - 4,
    frameY,
    featuresWidth + 8,
    frameHeight,
    "Features",
    bold,
  );
  drawFrame(
    page,
    x4 - 4,
    recordFrameY,
    itemsWidth + 8,
    recordFrameHeight,
    "Record",
    bold,
  );
  drawDeathSaves(
    page,
    x4 - 4,
    deathSavesY,
    itemsWidth + 8,
    deathSavesHeight,
    character.status === "fallen",
    regular,
    bold,
  );
  let statBoxTop = drawAbilityColumn(
    page,
    character,
    x1,
    contentTop,
    abilityWidth,
    contentBottom,
    regular,
    bold,
  );
  statBoxTop -= PDF_SPACING.armorClassFrameHeight;
  drawStatBox(
    page,
    "AC",
    String(character.armorClass),
    x1 - 4,
    statBoxTop,
    abilityWidth + 8,
    PDF_SPACING.armorClassFrameHeight,
    regular,
    bold,
    PDF_FONT_SIZES.armorClassLabel,
    PDF_FONT_SIZES.armorClassValue,
  );
  statBoxTop -= PDF_SPACING.armorClassFrameHeight + PDF_SPACING.statBoxGap;
  drawStatBox(
    page,
    "Initiative",
    formatModifier(character.modifiers.dex),
    x1 - 4,
    statBoxTop,
    abilityWidth + 8,
    PDF_SPACING.armorClassFrameHeight,
    regular,
    bold,
    PDF_FONT_SIZES.initiativeLabel,
    PDF_FONT_SIZES.initiativeValue,
  );
  drawSkills(
    page,
    character,
    x2,
    skillsFrameTop - PDF_SPACING.skillContentTop,
    skillsWidth,
    regular,
    bold,
  );
  const features: Feature[] = [
    { name: "ANCESTRY", summary: "" },
    ...visibleAncestryFeatures(character),
    ...(character.magic.length
      ? [
          {
            name: "Magic & Powers",
            summary: character.magic.map(formatMagicForPdf).join("\n"),
          },
        ]
      : []),
  ];
  drawFeatures(
    page,
    features,
    x3,
    contentTop,
    featuresWidth,
    contentBottom,
    regular,
    bold,
    italic,
  );
  drawItems(
    page,
    character,
    x4,
    contentTop,
    itemsWidth,
    recordFrameY + 5,
    regular,
    bold,
    italic,
  );
};

export const generatePdfBytes = async (
  records: CharacterRecordV1[],
  paperSize: PaperSize,
): Promise<Uint8Array> => {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle("Chronicles of Orrin Level-Zero Funnel");
  pdf.setSubject("Printable level-zero funnel characters");
  pdf.setCreator("Chronicles of Orrin Funnel");
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const nameFont = await pdf.embedFont(await loadAgencyFont());
  const [width, height] = PDF_PAGE_SIZES[paperSize];

  records.forEach((record, index) => {
    if (index % 2 === 0) {
      const page = pdf.addPage([width, height]);
      page.drawLine({
        start: { x: 12, y: height / 2 },
        end: { x: width - 12, y: height / 2 },
        thickness: 0.5,
        dashArray: [4, 4],
        color: muted,
      });
    }
    drawCharacter(
      pdf.getPages()[pdf.getPageCount() - 1]!,
      deriveCharacter(record),
      (index % 2) as 0 | 1,
      width,
      height,
      regular,
      bold,
      italic,
      nameFont,
    );
  });
  return pdf.save();
};

export const downloadCharacterPdf = async (
  records: CharacterRecordV1[],
  paperSize: PaperSize,
): Promise<void> => {
  const bytes = await generatePdfBytes(records, paperSize);
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download =
    "orrin-funnel-" + new Date().toISOString().slice(0, 10) + ".pdf";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
