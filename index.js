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
				const xmlData = fs.readFileSync(path.join(dirPath, file.name), { encoding: "utf8" });
				const json = xmljs.xml2js(xmlData, { ignoreComment: true });

				if (xmlData && json) {
					console.log("---> Loading target file:", file.name);
					targetFiles.set(path.join(dirName, file.name), json);
				}
			}
		});
	}
});

//
// Find and translate a file
//

console.log("Translating files...");

if (!fs.existsSync(path.resolve(config.outDir))) {
	fs.mkdirSync(path.resolve(config.outDir));
}

targetFiles.forEach((data, file) => {
	console.log("---> Load target file:", file);
	const filePath = path.resolve(config.translationDir, file);

	if (fs.existsSync(filePath)) {
		// Read translation file
		const xmlData = fs.readFileSync(filePath, { encoding: "utf8" }).replace(/&/g, "___amp___");
		const json = xmljs.xml2js(xmlData, { ignoreComment: true });

		// console.log(JSON.stringify(json, null, 4));

		// Attempt to translate file
		const translatedData = translate(data, json);
		const translatedFile = path.resolve(config.outDir, file);

		// Write translated data
		if (translatedData.countAttr > 0) {
			const dataXml = xmljs.json2xml(translatedData.element, { ignoreComment: true, spaces: 4 }).replace(/___amp___/g, "&");

			if (!fs.existsSync(path.dirname(translatedFile))) {
				fs.mkdirSync(path.dirname(translatedFile));
			}

			fs.writeFileSync(translatedFile, dataXml, { encoding: "utf8" });

			console.log("------> Translated", translatedData.countElem, "elements with", translatedData.countAttr, "attributes");
			console.log("---> Write translated data.");
		} else {
			console.log("---> Skip.");
		}
	}
});

console.log("Ended.");


function translate(elementSrc, elementDst, parentElements = [], level = 0, cntAttr = 0, cntElem = 0) {
	let countAttr = cntAttr;
	let elementDest = elementDst;
	let countElem = cntElem;

	if (elementSrc.attributes !== undefined && elementDest.attributes !== undefined) {
		// Check signature and find dest element
		const signature = checkSignature(elementSrc, elementDst, parentElements);

		// Translate attributes
		if (signature.passed) {
			elementDest = signature.elementDest;
			let cnt = 0;

			Object.keys(elementSrc.attributes).forEach(key => {
				if (translatedAttrs.includes(key.toLocaleLowerCase())) {
					if (elementSrc.attributes[key] != elementDest.attributes[key]) {
						elementSrc.attributes[key] = elementDest.attributes[key];

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

	// Parse elements
	if (Array.isArray(elementSrc.elements)) {
		Object.keys(elementSrc.elements).forEach(index => {
			if (elementDest.elements !== undefined && elementDest.elements[index] !== undefined) {
				// Process inner text
				if (elementSrc.elements[index].type === "text") {
					// Check signature and find dest element
					const signature = checkSignature(elementSrc, elementDest, parentElements);

					if (signature.passed) {
						// Translate inner text
						if (elementSrc.elements[index].text !== signature.elementDest.elements[index].text) {
							elementSrc.elements[index].text = signature.elementDest.elements[index].text;

							countAttr++;
							countElem++;
						}
					}
				} else {
					// Process elements
					const translated = translate(elementSrc.elements[index], elementDest.elements[index], elementDest.elements, level + 1, countAttr, countElem);

					elementSrc.elements[index] = translated.element;

					countAttr = translated.countAttr;
					countElem = translated.countElem;
				}
			}
		});
	}

	return {
		element: elementSrc,
		countAttr,
		countElem,
		level
	};
}

function checkSignature(elementSrc, elementDst, parentElements) {
	let elementDest = elementDst;
	let passed = 0;

	if (elementSrc.attributes !== undefined) {
		const signature = Object.keys(elementSrc.attributes).filter(k => signatureAttrs.includes(k.toLocaleLowerCase()));

		// Check signature of attributes in current position
		if (elementDest.attributes !== undefined) {
			signature.forEach(key => {
				if (elementSrc.attributes[key] === elementDest.attributes[key]) {
					passed++;
				}
			});
		}

		// Find element with matching signature and set it as elementDest
		if (passed !== signature.length && parentElements.length > 0) {
			parentElements.forEach(parentElement => {
				passed = 0;

				signature.forEach(key => {
					if (parentElement.attributes !== undefined && elementSrc.attributes[key] === parentElement.attributes[key]) {
						passed++;
					}
				});

				if (passed === signature.length) {
					elementDest = parentElement;
				} else {
					passed = signature.length;
				}
			});
		}
	}

	return { elementDest, passed: !!passed };
}