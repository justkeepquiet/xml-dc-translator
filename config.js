"use strict";

module.exports = {
	// Directory with DC xml files that need to be translated is indicated (in our case, TW DC).
	targetDir: "resources/DataCenter_Final_TW",

	// Directory with the donor DC containing the translation (in our case, EUR DC).
	translationDir: "resources/DataCenter_Final_EUR",

	// This directory will contain translated files (which have not been translated are not placed here).
	outDir: "resources/OUT",

	// List of element names that need translation (full name or initial part).
	translatedElements: [
		"StrSheet",
		"QuestDialog",
		"VillagerDialog",
		"ItemToolTip",
		"QuestGroupList",
		"MovieScript"
	],

	// List of elements to be excluded from the translation (full title or initial part).
	excludedTokens: [
		"ChatCommandList",
		"StrSheet_CollectionLoc",
		"StrSheet_EnchantableItem",
		"StrSheet_NpcLoc",
		"StrSheet_NpcLocManual",
		"StrSheet_WorkObjectLoc"
	],

	// List of attributes by which it is necessary to identify links between elements.
	signatureAttrs: [
		"id",
		"stringId",
		"shapeId",
		"collectionId",
		"readableId",
		"width",
		"templateId",
		"type",
		"huntingZoneId",
		"social",
		"endSocial",
		"eng"
	],

	// List of attributes to which the translation will be made.
	translatedAttrs: [
		"string",
		"title",
		"desc",
		"dec",
		"name",
		"arg1",
		"arg2",
		"arg3",
		"arg4",
		"tooltip",
		"tooltip1",
		"tooltip2",
		"tooltip3",
		"tooltip4",
		"uiString1",
		"uiString2",
		"uiString3",
		"uiString4",
		"class",
		"gender",
		"race",
		"skillName",
		"msg",
		"electionType",
		"__value__",
		"abilityItem1",
		"abilityItem1Value",
		"abilityItem2",
		"abilityItem2Value",
		"abilityItem3",
		"abilityItem3Value",
		"innerName",
		"alias",
		"interactionMenuName",
		"displayText"
	]
};