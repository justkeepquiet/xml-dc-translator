"use strict";

const fs = require("fs");
const path = require("path");
const xmljs = require("xml-js");

//
// Load configuration
//

const config = require("./config");

console.log("Configuration loaded...");

const translatedElements = config.translatedElements.map(v => v.toLocaleLowerCase());
const excludedTokens = config.excludedTokens.map(v => v.toLocaleLowerCase());
const signatureAttrs = config.signatureAttrs.map(v => v.toLocaleLowerCase());
const translatedAttrs = config.translatedAttrs.map(v => v.toLocaleLowerCase());

console.log("---> Translated Elements:", translatedElements.join(", "));
console.log("---> Excluded Tokens:", excludedTokens.join(", "));
console.log("---> Signature Attrs:", signatureAttrs.join(", "));
console.log("---> Translated Attrs:", translatedAttrs.join(", "));

//
// Parse files
//

console.log("Loading files...");

const targetFiles = new Map();
const targetDirs = fs.readdirSync(path.resolve(config.targetDir), { withFileTypes: true });

targetDirs.forEach(dir => {
	const dirPath = path.resolve(config.targetDir, dir.name);
	const dirName = dir.name;

	const check = translatedElements.find(el => dir.name.toLocaleLowerCase().startsWith(el)) !== undefined &&
		excludedTokens.find(el => dir.name.toLocaleLowerCase().startsWith(el)) === undefined;

	if (fs.lstatSync(dirPath).isDirectory() && check) {
		const files = fs.readdirSync(dirPath, { withFileTypes: true });

		files.forEach(file => {
			if (path.extname(file.name) === ".xml") {
				const targetData = readXml(path.join(dirPath, file.name));

				if (targetData) {
					console.log("---> Loading target file:", file.name);
					targetFiles.set(path.join(dirName, file.name), targetData);
				}
			}
		});
	}
});

//
// Find and translate a file
//

if (!fs.existsSync(path.resolve(config.outDir))) {
	fs.mkdirSync(path.resolve(config.outDir));
}

const translationDataArrays = new Map();
const translationDataElements = new Map();

let translationDirPathLast = null;

targetFiles.forEach((targetData, targetFile) => {
	const translationDirPath = path.resolve(config.translationDir, path.dirname(targetFile));
	let translationDirData = null;
	let translationDirDataElements = null;

	if (translationDirPathLast === null) {
		translationDirPathLast = translationDirPath;
	}

	if (translationDataArrays.has(translationDirPath)) {
		translationDirData = translationDataArrays.get(translationDirPath);
		translationDirDataElements = translationDataElements.get(translationDirPath);
	} else if (fs.existsSync(translationDirPath)) {
		const translationDir = fs.readdirSync(translationDirPath, { withFileTypes: true });
		const translationArray = [];
		const translationElements = [];

		translationDir.forEach((translationFile, i) => {
			if (path.extname(translationFile.name) === ".xml") {
				console.log(`---> Loading part ${i + 1}/${translationDir.length - 1}:`, translationFile.name);

				const translationFilePath = path.join(translationDirPath, translationFile.name);
				const translationDataEntry = readXml(translationFilePath);

				if (translationDataEntry) {
					if (translationDataEntry.elements !== undefined) {
						translationElements.push(...translationDataEntry.elements);
					}

					translationArray.push(translationDataEntry);
				}
			}
		});

		translationDataArrays.set(translationDirPath, translationArray);
		translationDataElements.set(translationDirPath, translationElements);

		translationDirData = translationArray;
		translationDirDataElements = translationElements;
	}

	console.log("Translating file:", targetFile);

	if (translationDirData) {
		let elementSigned = getElementBySignature(targetData, translationDirData, true);

		if (elementSigned === null) {
			if (path.dirname(targetFile) === "StrSheet_Item") {
				if (translationDirData.length > 1) {
					console.log("---> Root signature not found. Using file:", targetFile);
				}

				const translationFilePath = path.resolve(config.translationDir, targetFile);

				if (fs.existsSync(translationFilePath)) {
					elementSigned = readXml(translationFilePath);
				}
			} else {
				if (translationDirData.length > 1) {
					console.log("---> Root signature not found. Using merged parts...");
				}

				if (translationDirDataElements.length > 0) {
					elementSigned = {
						attributes: translationDirData[0].attributes,
						elements: translationDirDataElements
					};
				}
			}
		}

		if (elementSigned !== null) {
			const translatedData = translate(targetData, elementSigned);

			// Write translated data
			if (translatedData.countAttr > 0) {
				const translatedFile = path.resolve(config.outDir, targetFile);

				if (!fs.existsSync(path.dirname(translatedFile))) {
					fs.mkdirSync(path.dirname(translatedFile));
				}

				writeXml(translatedFile, translatedData.result);

				console.log("---> Translated", translatedData.countElem, "elements with", translatedData.countAttr, "attributes");
			} else {
				console.log("---> No data to translate. Skip.");
			}
		} else {
			console.log("---> Transtation not found. Skip.");
		}
	}

	// Cleanup
	if (translationDirPath !== translationDirPathLast) {
		console.log("Cleanup loaded parts.");
		translationDataArrays.delete(translationDirPath);
		translationDataElements.delete(translationDirPath);
		translationDirPathLast = null;
	}
});

console.log("Copy InputRestrictionData...");

if (!fs.existsSync(path.resolve(config.outDir, "InputRestrictionData"))) {
	fs.mkdirSync(path.resolve(config.outDir, "InputRestrictionData"));
}

fs.copyFileSync(
	path.resolve(config.translationDir, "InputRestrictionData", "InputRestrictionData-0.xml"),
	path.resolve(config.outDir, "InputRestrictionData", "InputRestrictionData-0.xml")
);

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

function translate(elementSrc, elementDest, parentElements = [], level = 0, cntAttr = 0, cntElem = 0) {
	let countAttr = cntAttr;
	let countElem = cntElem;

	if (elementSrc.attributes !== undefined && elementDest.attributes !== undefined) {
		if (elementSrc.name === "MovieScript") {
			// Translate MovieScript
			Object.keys(elementSrc.elements).forEach(index => {
				if (elementSrc.elements[index] !== undefined && elementDest.elements[index] !== undefined &&
					elementSrc.elements[index].attributes.string != elementDest.elements[index].attributes.string &&
					elementDest.elements[index].attributes.string != ""
				) {
					elementSrc.elements[index].attributes = {
						...elementSrc.elements[index].attributes,
						...elementDest.elements[index].attributes
					};

					countAttr++;
					countElem++;
				}
			});
		} else {
			const elementSigned = getElementBySignature(elementSrc, parentElements);

			// Translate attributes
			if (elementSigned !== null) {
				let cnt = 0;

				Object.keys(elementSrc.attributes).forEach(key => {
					if (translatedAttrs.includes(key.toLocaleLowerCase())) {
						if (elementSrc.attributes[key] != elementSigned.attributes[key] && elementSigned.attributes[key] != "") {
							elementSrc.attributes[key] = elementSigned.attributes[key];

							countAttr++;
							cnt++;
						}
					}
				});

				if (cnt > 0) {
					countElem++;
				}
			}
		}
	}

	if (Array.isArray(elementSrc.elements)) {
		Object.keys(elementSrc.elements).forEach(index => {
			if (elementDest.elements !== undefined && elementDest.elements[index] !== undefined) {
				// Process inner text
				if (elementSrc.elements[index].type === "text") {
					if (elementSrc.elements[index].text !== elementDest.elements[index].text && elementDest.elements[index].text != "") {
						elementSrc.elements[index].text = elementDest.elements[index].text;

						countAttr++;
						countElem++;
					}
				} else {
					// Process elements
					const translated = translate(elementSrc.elements[index], elementDest.elements[index], elementDest.elements, level + 1, countAttr, countElem);

					elementSrc.elements[index] = translated.result;

					countAttr = translated.countAttr;
					countElem = translated.countElem;
				}
			}
		});
	}

	return {
		result: elementSrc,
		countAttr,
		countElem,
		level
	};
}

function getElementBySignature(element, parentElements, strict = false) {
	let result = null;
	let checks = 0;

	if (element.attributes !== undefined && parentElements.length > 0) {
		const signature = Object.keys(element.attributes).filter(k => signatureAttrs.includes(k.toLocaleLowerCase()));

		parentElements.forEach(parentElement => {
			if (result === null) {
				checks = 0;

				signature.forEach(key => {
					if (parentElement.attributes !== undefined && element.attributes[key] === parentElement.attributes[key]) {
						checks++;
					}
				});

				if ((!strict || signature.length > 0) && checks === signature.length) {
					result = parentElement;
				}
			}
		});
	}

	return result;
}