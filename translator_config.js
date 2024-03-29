"use strict";

// Selected profile.
const PROFILE = 1;

// Config profiles.
const profiles = {

	// PROFILE 1.
	// Main profile (full translation TW -> EUR).
	1: {
		// Directory with DC xml files that need to be translated is indicated (in our case, TW DC).
		targetDir: "resources/DataCenter_Final_TW",

		// Directory with the donor DC containing the translation (in our case, EUR DC).
		translationDir: "resources/DataCenter_Final_EUR",

		// This directory will contain translated files (which have not been translated are not placed here).
		outDir: "resources/OUT_EUR"
	},

	// PROFILE 2.
	// Main profile (full translation TW -> RUS).
	2: {
		// Directory with DC xml files that need to be translated is indicated (in our case, TW DC).
		targetDir: "resources/DataCenter_Final_TW",

		// Directory with the donor DC containing the translation (in our case, EUR DC).
		translationDir: "resources/DataCenter_Final_RUS",

		// This directory will contain translated files (which have not been translated are not placed here).
		outDir: "resources/OUT_RUS"
	},

	// PROFILE 10.
	// For strings mergings from other DCs (e.g. item names, etc.)
	// Place your translated DC or it's part into "targetDir", and DC contains translation of untranslated
	// string into "translationDir", after translation process is ended, new files will be placed to "outDir".
	10: {
		// Translate only strings matching the given pattern.
		//    \\p{Script=Han} - strings, contains chinese characters.
		//    ^$ - empty strings.
		//    | - symbol of logic "or".
		pattern: new RegExp("\\p{Script=Han}|^$", "u"),

		// Directories settings.
		targetDir: "resources/OUT",
		translationDir: "resources/TRANS",
		outDir: "resources/OUT"
	}
};

module.exports = {
	// List of element names (directories) that need translation, with configuration statement.
	//    rootSign - array of root level attributes by which it is necessary to identify links between elements.
	//    sign - array of attributes by which it is necessary to identify links between elements.
	//    attr - array of attributes to which the translation will be made.
	//    keep - if true specified, keep old (chinese) for untranslated strings.
	categories: {
		StrSheet_Abnormality: { sign: ["id"], attr: ["name", "tooltip"], keep: true },
		StrSheet_AbnormalityKind: { sign: ["id"], attr: ["name"] },
		StrSheet_AccessoryTransform: { sign: ["id"], attr: ["string"] },
		StrSheet_AccountBenefit: { sign: ["id"], attr: ["string"] },
		StrSheet_Achievement: { sign: ["id"], attr: ["string"] },
		StrSheet_AchievementGradeInfo: { sign: ["id"], attr: ["string"] },
		StrSheet_ActionKey: { sign: ["collectionId", "shapeId"], attr: ["string"] },
		StrSheet_ActPoint: { sign: ["readableId"], attr: ["desc", "title"] },
		StrSheet_AdminTool: { sign: ["readableId"], attr: ["string"] },
		StrSheet_Agit: { sign: ["id"], attr: ["string"] },
		StrSheet_Artisan: { sign: ["id"], attr: ["string", "toolTip"] },
		StrSheet_AwesomiumWeb: { sign: ["id"], attr: ["string"] },
		StrSheet_BalloonGuide: { sign: ["id"], attr: ["string"] },
		StrSheet_Banner: { sign: ["id"], attr: ["string"] },
		StrSheet_BattleField: { sign: ["id"], attr: ["string"] },
		StrSheet_BattlePassMissionKindList: { sign: ["kind"], attr: ["memo"] },
		StrSheet_Betting: { sign: ["id"], attr: ["string"] },
		StrSheet_BFInfoBoard: { sign: ["id"], attr: ["string"] },
		StrSheet_Board: { sign: ["id"], attr: ["string"] },
		StrSheet_BrokerageOptionCategory: { sign: ["type", "id"], attr: ["string"] },
		StrSheet_BuyMenu: { sign: ["id"], attr: ["string"] },
		StrSheet_Card: { sign: ["id"], attr: ["name", "tooltip1", "tooltip2"] },
		StrSheet_CardCombineList: { sign: ["id"], attr: ["name"] },
		StrSheet_CardSystem: { sign: ["id"], attr: ["string"] },
		StrSheet_Charm: { sign: ["id"], attr: ["string", "tooltip"] },
		StrSheet_CharmKind: { sign: ["id"], attr: ["name"] },
		StrSheet_Chat: { sign: ["id"], attr: ["string"] },
		StrSheet_ChatChannelName: { sign: ["id"], attr: ["name", "shortcuts"] },
		StrSheet_CityWar: { sign: ["id"], attr: ["string"] },
		StrSheet_ClassInfo: { sign: ["id"], attr: ["string"] },
		StrSheet_CoherentGTWeb: { sign: ["id"], attr: ["string"] },
		StrSheet_Collections: { sign: ["collectionId"], attr: ["string"] },
		StrSheet_Countdown: { sign: ["id"], attr: ["string"] },
		StrSheet_Creature: { sign: ["id", "templateId", "creatureSize"], attr: ["string", "class", "name", "gender", "race", "title"] },
		StrSheet_Crest: { sign: ["id"], attr: ["name", "tooltip", "skillName"] },
		StrSheet_CustomizeKeyData: { sign: ["id"], attr: ["string"] },
		StrSheet_CustomizePadButtonData: { sign: ["id"], attr: ["string"] },
		StrSheet_Customizing: { sign: ["id"], attr: ["string"] },
		StrSheet_DailyPlayGuideQuest: { sign: ["id"], attr: ["string"] },
		StrSheet_DarkRift: { sign: ["id"], attr: ["string"] },
		StrSheet_Days: { sign: ["id"], attr: ["string"] },
		StrSheet_Dreampiece: { sign: ["name"], attr: ["string"] },
		StrSheet_Dungeon: { sign: ["id"], attr: ["string"] },
		StrSheet_DungeonMatching: { sign: ["readableId"], attr: ["string"] },
		StrSheet_DungeonMatchingMail: { sign: ["id"], attr: ["string"] },
		StrSheet_DungeonRank: { sign: ["id"], attr: ["msg"] },
		StrSheet_DungeonWork: { sign: ["id"], attr: ["string"] },
		StrSheet_Election: { sign: ["id"], attr: ["name", "tooltip", "electionType"] },
		StrSheet_EnchantableItem: { sign: ["name"], attr: ["string"] },
		StrSheet_EnchantPopup: { sign: ["id"], attr: ["string"] },
		StrSheet_EnchantRecommend: { sign: ["id"], attr: ["string", "title"] },
		StrSheet_EnchantRenewal: { sign: ["id"], attr: ["string"] },
		StrSheet_EpPerkData: { sign: ["id"], attr: ["name", "string", "tooltip", "arg1", "arg2", "arg3", "arg4", "uiString1", "uiString2", "uiString3", "uiString4"] },
		StrSheet_EquipmentSetData: { sign: ["id"], attr: ["string"] },
		StrSheet_Event: { sign: ["id"], attr: ["string"] },
		StrSheet_EventDialog: { sign: ["id"], attr: ["string"] },
		StrSheet_EventMatching: { sign: ["id"], attr: ["string"] },
		StrSheet_EventSystem: { sign: ["id"], attr: ["string"] },
		StrSheet_Field: { sign: ["id"], attr: ["string"] },
		StrSheet_FlagItem: { sign: ["id"], attr: ["string"] },
		StrSheet_FloatingCastle: { sign: ["id"], attr: ["string", "toolTip"] },
		StrSheet_GameStat: { sign: ["readableId"], attr: ["string"] },
		StrSheet_General: { sign: ["readableId"], attr: ["string"] },
		StrSheet_GmEvent: { sign: ["id"], attr: ["string"] },
		StrSheet_Guild: { sign: ["readableId"], attr: ["string"] },
		StrSheet_GuildCompetition: { sign: ["id"], attr: ["string"] },
		StrSheet_GuildMail: { sign: ["id"], attr: ["string"] },
		StrSheet_GuildQuest: { sign: ["id"], attr: ["string"] },
		StrSheet_HelpData: { sign: ["id"], attr: [] },
		StrSheet_HeroSkill: { sign: ["id", "templateId"], attr: ["name", "tooltip"] },
		StrSheet_HeroSkin: { sign: ["id"], attr: ["name", "description", "attackRange", "attackDistance", "classConcept", "heroStoryDescription", "heroStoryTitle"] },
		StrSheet_HuntingZoneEvent: { sign: ["id"], attr: ["string"] },
		StrSheet_HuntingZoneEventType: { sign: ["readableId"], attr: ["string"] },
		StrSheet_InputRestriction: { sign: ["id"], attr: ["string"] },
		StrSheet_InviteFriend: { sign: ["id"], attr: ["string"] },
		StrSheet_Item: { sign: ["id"], attr: ["toolTip", "string"], keep: true },
		StrSheet_KeyGuide: { sign: ["id"], attr: ["string"] },
		StrSheet_Leaderboards: { sign: ["id"], attr: ["string"] },
		StrSheet_LoadingImage: { sign: ["id"], attr: ["string"] },
		StrSheet_LordAchievement: { sign: ["id"], attr: ["string"] },
		StrSheet_Masstige: { sign: ["readableId"], attr: [] },
		StrSheet_MiniGame: { sign: ["id"], attr: ["string"] },
		StrSheet_MonsterBehavior: { sign: ["id"], attr: ["msg"] },
		StrSheet_Months: { sign: ["id"], attr: ["string"] },
		StrSheet_NocTan: { sign: ["id"], attr: ["string"] },
		StrSheet_NotifyMessage: { sign: ["id"], attr: ["string"] },
		StrSheet_Npc: { sign: ["id"], attr: ["string"] },
		StrSheet_NpcArena: { sign: ["id"], attr: ["string"] },
		StrSheet_NPCGuild: { sign: ["id"], attr: ["toolTip", "string"] },
		StrSheet_NPCGuildGroup: { sign: ["id"], attr: ["string"] },
		StrSheet_Option: { sign: ["readableId"], attr: ["string"] },
		StrSheet_Parcel: { sign: ["id"], attr: ["string"] },
		StrSheet_Party: { sign: ["readableId"], attr: ["string"] },
		StrSheet_PassiveMainString: { sign: ["type", "id", "name"], attr: ["string"] },
		StrSheet_PassiveStatsDefine: { sign: ["type", "id"], attr: ["string"] },
		StrSheet_Passivity: { sign: ["id"], attr: ["name", "tooltip"] },
		StrSheet_Petition: { sign: ["id"], attr: ["string"] },
		StrSheet_PetitionTitle: { sign: ["readableId"], attr: ["string"] },
		StrSheet_Politics: { sign: ["id"], attr: ["string"] },
		StrSheet_PremiumCompose: { sign: ["id"], attr: ["string"] },
		StrSheet_Quest: { sign: ["id"], attr: ["string"] },
		StrSheet_ReferAFriend: { sign: ["id"], attr: ["string"] },
		StrSheet_Region: { sign: ["id"], attr: ["string"] },
		StrSheet_ReplayMovie: { sign: ["id"], attr: ["string"] },
		StrSheet_Reputation: { sign: ["id"], attr: ["string"] },
		StrSheet_ReturnUserGuide: { sign: ["id"], attr: ["string"] },
		StrSheet_RewardMessage: { sign: ["id"], attr: ["string"] },
		StrSheet_Rune: { sign: ["id"], attr: ["name"] },
		StrSheet_ScenarioDungeon: { sign: ["id"], attr: ["string"] },
		StrSheet_Seren: { sign: ["id"], attr: ["string"] },
		StrSheet_Servant: { sign: ["id"], attr: ["string"] },
		StrSheet_ServantAdventure: { sign: ["readableId"], attr: ["string"] },
		Strsheet_ServantAdventureCompensation: { sign: ["id"], attr: ["string"] },
		StrSheet_ServantAdventureField: { sign: ["id"], attr: ["name"] },
		StrSheet_ServantSkill: { sign: ["id"], attr: ["name", "tooltip"] },
		StrSheet_SkillPolishingEffect: { sign: ["id"], attr: ["name", "tooltip", "abilityItem1", "abilityItem1Value", "abilityItem2", "abilityItem2Value", "abilityItem3", "abilityItem3Value", "innerName"] },
		StrSheet_SkillWindowPopUp: { sign: ["id"], attr: ["title", "tip"] },
		StrSheet_SlashCommand: { sign: ["id"], attr: ["name", "alias", "interactionMenuName"] },
		StrSheet_SmartQuery: { sign: ["id"], attr: ["string"] },
		StrSheet_Social: { sign: ["id"], attr: ["string"] },
		StrSheet_Species: { sign: ["id"], attr: ["name"] },
		StrSheet_StackAttendanceEvent: { sign: ["id"], attr: ["string"] },
		StrSheet_StyleShop: { sign: ["id"], attr: ["string"] },
		StrSheet_Support: { sign: ["id"], attr: ["string"] },
		StrSheet_SystemMessage: { sign: ["readableId"], attr: ["string"] },
		StrSheet_TBACommon: { sign: ["readableId"], attr: ["string"] },
		StrSheet_Teleport: { sign: ["stringId"], attr: ["string"] },
		StrSheet_TradeBrokerCategory: { sign: ["id"] },
		StrSheet_TrialAccount: { sign: ["id"], attr: ["string"] },
		StrSheet_Tutorial: { sign: ["id"], attr: ["string"] },
		StrSheet_UI: { sign: ["stringId"], attr: ["string"] },
		StrSheet_UnidentifiedItem: { sign: ["name"], attr: ["string"] },
		StrSheet_UserSkill: { sign: ["id", "class", "gender", "race"], attr: ["name", "tooltip"], keep: true },
		StrSheet_VehicleSkill: { sign: ["id", "templateId", "huntingZoneId"], attr: ["name", "tooltip"] },
		StrSheet_VIPBenefit: { sign: ["id"], attr: ["string"] },
		StrSheet_VIPMail: { sign: ["id"], attr: ["string"] },
		StrSheet_VIPStoreAvatar: { sign: ["id"], attr: ["string"] },
		StrSheet_WorkObject: { sign: ["id"], attr: ["string"] },
		StrSheet_ZoneName: { sign: ["id"], attr: ["string"] },
		// CustomizePadButtonData: { sign: ["id"], attr: ["name"] }, // contains issues. check?
		QuestDialog: { rootSign: ["id", "huntingZoneId"], sign: ["id", "huntingZoneId", "prevId", "villagerId"] },
		VillagerDialog: { rootSign: ["id", "huntingZoneId"], sign: ["id", "endSocial"] },
		ItemToolTip: { sign: ["eng"], attr: ["displayText"] },
		QuestGroupList: { sign: ["id"], attr: ["name", "dec"] },
		MovieScript: { rootSign: ["id"], sign: ["id"], attr: ["string", "duration", "startTime"] }
	},

	// Assign selected config profile.
	...profiles[PROFILE]
};