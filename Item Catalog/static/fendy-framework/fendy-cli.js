#!/usr/bin/env node

/**
 * Fendy CLI v.1.0.0
 * This is a small tool to scaffold fendy-framework in your project.
 * Scaffolding involves:
 *
 * 1. Create the ITCSS folder structure inside the desired directory
 * 2. Create an 'index' Sass file that imports fendy-framework with the
 * 		correct relative path
 */

const argv = require('minimist')(process.argv.slice(2));
const files = require('./lib/files');

const current = files.getCurrentPath();
const fendy = files.getRealPath();
const relativePath = files.getRelativePath(current, fendy).replace(/\/lib|lib/g, '');

// Limit scaffolding to directories above fendy-framework
if (relativePath != '') {
	const itcss = [
		'settings',
		'tools',
		'generic',
		'elements',
		'objects',
		'components',
		'utilities'
	];
	const directoryName = argv.d.replace(/\/|\./g, '');
	const indexFileName = argv.f;

	// If the desired directory does not exists, create it
	if (!files.directoryExists(directoryName)) files.createDirectory(directoryName);

	// Create the directory structure
	itcss.map((l) => {
		if (!files.directoryExists(`${directoryName}/${l}`)) files.createDirectory(`${directoryName}/${l}`);
	});

	// Read the frameworks main sass file and replicate it with the correct paths
	// inside the desired directory
	const fileContent = files.readFile(`${relativePath}/main.scss`)
		.replace(/\.\//g, `./../${relativePath}/`)
		.replace('fendy-framework/node_modules/', ''); // Normalize should be in the same directory as fendy-framework

	files.writeFile(`${directoryName}/${indexFileName}`, fileContent);

} else {
	console.error('Fendy CLI must be used in directories above the fendy-framework directory.');
}
