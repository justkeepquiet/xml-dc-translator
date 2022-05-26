"use strict";

const fs = require("fs");
const path = require("path");
const xmljs = require("xml-js");
const config = require("./restorate_config");

//
// Parse files
//

const targetFiles = new Map();
const strSheetElements = [];
const dataElements = [];

console.log("Loading StrSheet files...");

const strSheetDirPath = path.resolve(config.targetDir, config.stringCategory);
const dataDirPath = path.resolve(config.targetDir, config.dataCategory);

if (fs.existsSync(strSheetDirPath)) {
	const strSheetFiles = fs.readdirSync(strSheetDirPath, { withFileTypes: true });

	strSheetFiles.forEach(file => {
		if (path.extname(file.name) === ".xml") {
			const data = readXml(path.join(strSheetDirPath, file.name));

			if (data) {
				data.elements.forEach(element => strSheetElements.push(element.attributes));
				targetFiles.set(path.join(config.stringCategory, file.name), data);

				console.log("---> Loaded file", file.name, "with", data.elements.length, "elements");
			}
		}
	});
} else {
	console.error("StrSheet directory not found.");
}

console.log("Loading data files...");

if (fs.existsSync(dataDirPath)) {
	const strSheetFiles = fs.readdirSync(dataDirPath, { withFileTypes: true });

	strSheetFiles.forEach(file => {
		if (path.extname(file.name) === ".xml") {
			const data = readXml(path.join(dataDirPath, file.name));

			if (data) {
				data.elements.forEach(element => dataElements.push(element.attributes));

				console.log("---> Loaded file", file.name, "with", data.elements.length, "elements");
			}
		}
	});
} else {
	console.error("Data directory not found.");
}

//
// Find and translate a file
//

if (!fs.existsSync(path.resolve(config.outDir))) {
	fs.mkdirSync(path.resolve(config.outDir));
}

targetFiles.forEach((data, filename) => {
	console.log("Restoring for file:", filename);
	const translatedData = translate(data);

	if (translatedData !== null) {
		if (translatedData.countAttr > 0) {
			const filePath = path.resolve(config.outDir, filename);

			if (!fs.existsSync(path.dirname(filePath))) {
				fs.mkdirSync(path.dirname(filePath));
			}

			writeXml(filePath, translatedData.result);
			console.log("---> Restored", translatedData.countElem, "elements with", translatedData.countAttr, "attributes");
		} else {
			console.log("---> No data to restore. Skip.");
		}
	} else {
		console.log("---> Restoration data not found. Skip.");
	}
});

console.log("Ended.");

//
// Functions
//

function readXml(file) {
	return xmljs.xml2js(fs.readFileSync(file, { encoding: "utf8" }).replace(/&/g, "___amp___"), { ignoreComment: true }).elements[0];
}

function writeXml(file, data) {
	return fs.writeFileSync(file, xmljs.json2xml({ elements: [data] }, { ignoreComment: true, spaces: 4 }).replace(/___amp___/g, "&"), { encoding: "utf8" });
}

function translate(sourceElement, level = 0, total = 0, cntAffected = 0, cntAttr = 0, cntElem = 0) {
	let countAffected = cntAffected;
	let countAttr = cntAttr;
	let countElem = cntElem;

	if (sourceElement.attributes !== undefined) {
		const approvedkeys = [];
		countAffected++;

		Object.keys(sourceElement.attributes).forEach(key => {
			if (config.attributes !== undefined &&
				config.attributes.map(a => a.toLocaleLowerCase()).includes(key.toLocaleLowerCase()) &&
				config.pattern.test(sourceElement.attributes[key])
			) {
				approvedkeys.push(key);
			}
		});

		if (approvedkeys.length > 0) {
			const elementfound = findTranslation(sourceElement.attributes.id);

			if (elementfound !== null) {
				let cnt = 0;

				Object.keys(sourceElement.attributes).forEach(key => {
					if (approvedkeys.includes(key) && elementfound[key] !== undefined && sourceElement.attributes[key] != elementfound[key]) {
						console.log(countAffected, "/", total, "Found for", sourceElement.attributes.id, key, ":",
							`${sourceElement.attributes[key].substr(0, 10) || "[empty]"}`, "==>", `${elementfound[key].substr(0, 30)}...`);

						sourceElement.attributes[key] = elementfound[key];

						countAttr++;
						cnt++;
					}
				});

				if (cnt > 0) {
					countElem++;
				}
			} else {
				console.log(countAffected, "/", total, "Not found for", sourceElement.attributes.id);
			}
		} else if (total > 0) {
			console.log(countAffected, "/", total, "Skipped for", sourceElement.attributes.id);
		}
	}

	if (Array.isArray(sourceElement.elements) && sourceElement.elements.length > 0) {
		Object.keys(sourceElement.elements).forEach(index => {
			if (sourceElement.elements !== undefined) {
				const translated = translate(sourceElement.elements[index], level + 1, sourceElement.elements.length, countAffected, countAttr, countElem);

				sourceElement.elements[index] = translated.result;

				countAffected = translated.countAffected;
				countAttr = translated.countAttr;
				countElem = translated.countElem;
			}
		});
	}

	return {
		result: sourceElement,
		countAffected,
		countAttr,
		countElem,
		level
	};
}

function findTranslation(id) {
	let result = null;
	const foundElement = dataElements.find(e => e.id == id);

	if (foundElement) {
		const signedElements = getElementsBySignature(foundElement, dataElements);

		signedElements.forEach(element => {
			if (result === null) {
				const found = strSheetElements.find(e => e.id == element.id);

				config.attributes.forEach(key => {
					if (!result && found[key] !== undefined && !config.pattern.test(found[key]) && found[key].trim() != "") {
						result = found;
					}
				});
			}
		});
	}

	return result;
}

function getElementsBySignature(sourceElement, parentElements) {
	const result = [];
	let checks = 0;

	const signature = Object.keys(sourceElement).filter(k => config.signature.includes(k.toLocaleLowerCase()));

	parentElements.forEach(parentElement => {
		checks = 0;

		signature.forEach(key => {
			if (parentElement !== undefined && sourceElement[key] === parentElement[key]) {
				checks++;
			}
		});

		if (signature.length > 0 && checks === signature.length) {
			result.push(parentElement);
		}
	});

	return result;
}