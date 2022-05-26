"use strict";

module.exports = {
	// Directory with DC xml files that need to be restored is indicated.
	targetDir: "resources/OUT",

	// This directory will contain files with restored strings.
	outDir: "resources/OUT_RESTORED",

	// Name of directory, contains string sheets of the items.
	stringCategory: "StrSheet_Item",

	// Name of directory, contains the unique information to resolve items.
	dataCategory: "ItemData",

	// Restore only strings matching the given pattern.
	//    \\p{Script=Han} - strings, contains chinese characters.
	//    ^$ - empty strings.
	//    | - symbol of logic "or".
	pattern: new RegExp("\\p{Script=Han}|^$", "u"),

	// Array of attributes by which it is necessary to found similar elements.
	signature: [
		"category",
		"name",
		"icon",
		"accessoryColorId",
		"autoPickUpEffectId",
		"changeEnchantFxId",
		"decompositionId",
		"equipmentSetId",
		"itemMixId",
		"linkCardId",
		"linkChangeColorListId",
		"linkCrestId",
		"linkCustomizingId",
		"linkEnchantId",
		"linkEquipmentExpId",
		"linkEquipmentGroupId",
		"linkEquipmentId",
		"linkLookInfoId",
		"linkMasterpieceEnchantId",
		"linkMasterpiecePassivityCategoryId",
		"linkMasterpiecePassivityId",
		"linkMaterialEnchantId",
		"linkMaterialRepairId",
		"linkPassivityCategoryId",
		"linkPassivityId",
		"linkPetAdultId",
		"linkPetOrbId",
		"linkRawStoneId",
		"linkSkillId",
		"linkSkillPeriodDay",
		"linkSocialId",
		"periodItemCategoryId",
		"seasonId",
		"styleCostumeId"
	],

	// Array of attributes to which the translation will be made.
	attributes: [
		"string",
		"tooltip"
	]
};