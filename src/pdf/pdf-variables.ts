export const PDF_FONT_SIZES = {
  // frames
  frameLabel: 10,

  // abilities
  abilityLabel: 8,
  abilityScore: 8,
  abilityModifier: 11,
  savingThrowLabel: 8,
  savingThrowValue: 8,

  // stats
  statLabel: 10,
  statValue: 10,

  // armor class
  armorClassLabel: 10,
  armorClassValue: 10,

  // initiative
  initiativeLabel: 10,
  initiativeValue: 10,

  // hp
  hitPointCurrent: 8,
  hitPointLabel: 8,
  hitPointMaximum: 13,

  // death
  deathSaveLabel: 5,
  fallenStamp: 25,

  // skills
  skillName: 9,
  skillAbility: 9,
  skillScore: 9,

  // features
  featureDefault: 10,
  featureMinimum: 8,

  // character name and identity
  characterNameStart: 15,
  characterNameMinimum: 10,
  characterNameStep: 0.5,
  characterIdentity: 10,
} as const;

export const PDF_SPACING = {
  // headers
  headerTopOffset: 20,
  headerDividerOffset: 15,
  headerContentOffset: 29,

  // frames
  frameGap: 10,
  frameContentTop: 15,
  armorClassFrameHeight: 40,
  statBoxGap: 8,

  // abilities
  abilityColumnWidth: 80,
  abilityLabelHorizontalOffset: -5,
  abilityLabelBaselineOffset: 3.5,
  abilityRowHeight: 28,
  abilityScoreBoxOffset: 17,
  abilityModifierOffset: 50,
  abilityScoreValueInset: -5,

  // saves
  savingThrowColumnOffset: 65,
  savingThrowLabelHorizontalOffset: -4,
  savingThrowMarkerOffset: 2,
  savingThrowValueOffset: 6,
  savingThrowHeaderToFirstRow: 12,
  savingThrowMarkerBaselineOffset: -0.5,
  savingThrowMarkerSize: 2.6,
  savingThrowMarkerBorderWidth: 0.65,
  savingThrowValueBaselineOffset: 3.5,

  // skills
  skillColumnGap: 1,
  skillContentTop: 12,
  skillBonusColumnWidth: 15,
  skillAbilityColumnWidth: 28,
  skillRowHeight: 15,
  skillDividerOffset: 4,
  skillMarkerBaselineOffset: 1.5,
  skillDividerThickness: 0.35,
  skillDividerDashLength: 1,
  skillDividerDashGap: 1.5,

  // features
  featureSectionGap: 3,
} as const;
