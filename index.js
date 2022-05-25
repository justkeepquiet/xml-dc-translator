"use strict";

const fs = require("fs");
const path = require("path");
const xmljs = require("xml-js");
const config = require("./config");

//
// Parse files
//

console.log("Loading files...");

const targets = new Set();

Object.keys(config.categories).forEach(category => {
	const dirPath = path.resolve(config.targetDir, category);

	if (fs.existsSync(dirPath)) {
		const files = fs.readdirSync(dirPath, { withFileTypes: true });

		files.forEach(file => {
			if (path.extname(file.name) === ".xml") {
				const data = readXml(path.join(dirPath, file.name));

				if (data) {
					console.log("---> Loading target file:", file.name);
					targets.add({
						config: config.categories[category],
						filename: path.join(category, file.name),
						category,
						data
					});
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

const cachedTransData = new Map();
const cachedTransElements = new Map();

let transDirPathLast = null;

targets.forEach(target => {
	let transData = null;
	let transElements = null;

	const transDirPath = path.resolve(config.translationDir, target.category);

	if (transDirPathLast === null) {
		transDirPathLast = transDirPath;
	}

	// Cleanup
	if (transDirPath !== transDirPathLast) {
		console.log("Cleanup loaded parts.");

		cachedTransData.delete(transDirPath);
		cachedTransElements.delete(transDirPath);
		transDirPathLast = null;
	}

	if (cachedTransData.has(transDirPath)) {
		transData = cachedTransData.get(transDirPath);
		transElements = cachedTransElements.get(transDirPath);
	} else {
		// Collect data from translation files
		const transDataArray = [];
		const transElementsArray = [];

		if (fs.existsSync(transDirPath)) {
			const transDir = fs.readdirSync(transDirPath, { withFileTypes: true });

			transDir.forEach((transFile, i) => {
				if (path.extname(transFile.name) === ".xml") {
					console.log(`---> Loading part ${i + 1}/${transDir.length - 1}:`, transFile.name);

					const transFilePath = path.join(transDirPath, transFile.name);
					const transDataEntry = readXml(transFilePath);

					if (transDataEntry && transDataEntry.elements !== undefined) {
						transDataArray.push(transDataEntry);
						transElementsArray.push(...transDataEntry.elements);
					}
				}
			});

			cachedTransData.set(transDirPath, transDataArray);
			cachedTransElements.set(transDirPath, transElementsArray);

			transData = transDataArray;
			transElements = transElementsArray;
		}
	}

	if (transData) {
		let signedTransData = null;

		if (target.config.rootSign !== undefined && target.config.rootSign.length > 0) {
			// If root signature defined, try to find data in translation data array
			signedTransData = getElementBySignature(target.config.rootSign.map(s => s.toLocaleLowerCase()), target.data, null, transData, true);
		} else if (transElements.length > 0) {
			// If root element not specified, merge all data from all translation data arrays
			signedTransData = {
				attributes: transData[0].attributes,
				elements: transElements
			};
		}

		if (signedTransData !== null) {
			console.log("Translating file:", target.filename);
			const data = translate(target.config, target.data, signedTransData);

			// Write translated data
			if (data.countAttr > 0) {
				const filename = path.resolve(config.outDir, target.filename);

				if (!fs.existsSync(path.dirname(filename))) {
					fs.mkdirSync(path.dirname(filename));
				}

				writeXml(filename, data.result);
				console.log("---> Translated", data.countElem, "elements with", data.countAttr, "attributes");
			} else {
				console.log("---> No data to translate. Skip.");
			}
		} else {
			console.log("---> Transtation not found. Skip.");
		}
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

function translate(elementConf, elementSrc, elementDest, parentElements = [], level = 0, cntAttr = 0, cntElem = 0) {
	let countAttr = cntAttr;
	let countElem = cntElem;

	// If attributes is present
	if (elementSrc.attributes !== undefined && elementDest.attributes !== undefined) {
		if (elementSrc.name === "MovieScript") {
			// Translate MovieScript
			Object.keys(elementSrc.elements).forEach(index => {
				if (elementSrc.elements[index] !== undefined) {
					if (elementDest.elements[index] !== undefined &&
						elementSrc.elements[index].attributes.string != elementDest.elements[index].attributes.string &&
						(elementDest.elements[index].attributes.string != "" || !elementConf.keep)
					) {
						elementSrc.elements[index].attributes = {
							...elementSrc.elements[index].attributes,
							...elementDest.elements[index].attributes
						};

						countAttr++;
						countElem++;
					} else {
						// leave empty or delete this entry?
						elementSrc.elements[index].attributes.string = "";
						// delete elementSrc.elements[index];
					}
				}
			});
		} else {
			const elementSigned = getElementBySignature(elementConf.sign, elementSrc, elementDest, parentElements);

			// Translate attributes
			if (elementSigned !== null) {
				let cnt = 0;

				Object.keys(elementSrc.attributes).forEach(key => {
					if (elementConf.attr !== undefined && elementConf.attr.map(a => a.toLocaleLowerCase()).includes(key.toLocaleLowerCase())) {
						if (elementSigned.attributes[key] !== undefined &&
							(elementSigned.attributes[key] != "" || !elementConf.keep) &&
							elementSrc.attributes[key] != elementSigned.attributes[key]
						) {
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

	// If elements is present
	if (Array.isArray(elementSrc.elements) && elementSrc.elements.length > 0) {
		Object.keys(elementSrc.elements).forEach(index => {
			if (elementDest.elements !== undefined && elementDest.elements[index] !== undefined) {
				// Process inner text
				if (elementSrc.elements[index].type === "text") {
					if (elementSrc.elements[index].text !== elementDest.elements[index].text && (elementDest.elements[index].text != "" || !elementConf.keep)) {
						elementSrc.elements[index].text = elementDest.elements[index].text;

						countAttr++;
						countElem++;
					}
				} else {
					// Process elements
					const translated = translate(elementConf, elementSrc.elements[index], elementDest.elements[index], elementDest.elements, level + 1, countAttr, countElem);

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

function getElementBySignature(configSign, elementSrc, elementDest, parentElements, strict = false) {
	let result = null;
	let checks = 0;

	if (elementSrc.attributes !== undefined && parentElements.length > 0) {
		const signature = Object.keys(elementSrc.attributes).filter(k => configSign.includes(k.toLocaleLowerCase()));

		// Check signature of attributes in current position
		if (elementDest && elementDest.attributes !== undefined) {
			signature.forEach(key => {
				if (elementSrc.attributes[key] === elementDest.attributes[key]) {
					checks++;
				}
			});

			if ((!strict || signature.length > 0) && checks === signature.length) {
				result = elementDest;
			}
		}

		// Find element with matching signature and set it as elementDest
		if (!result && parentElements.length > 0) {
			parentElements.forEach(parentElement => {
				if (result === null) {
					checks = 0;

					signature.forEach(key => {
						if (parentElement.attributes !== undefined && elementSrc.attributes[key] === parentElement.attributes[key]) {
							checks++;
						}
					});

					if ((!strict || signature.length > 0) && checks === signature.length) {
						result = parentElement;
					}
				}
			});
		}
	}

	return result;
}