// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const sfcc = require('sfcc-ci');
const fs = require('fs');
const path = require("path");
const archiver = require('archiver');

function archiveFiles(archiveName, targetDirectory, files, callback) {
    var output = fs.createWriteStream(path.join(targetDirectory, archiveName + '.zip'));
    var archive = archiver('zip');

    archive.on('error', function(err){
        throw err;
    });

    archive.pipe(output);

	files.forEach(filepath => {
		let fileName = filepath.replace(/^.*[\\\/]/, '');
		archive.file(targetDirectory + '/' + filepath, { name: 'site_template/meta/' + fileName })
	});
    
    archive.finalize();

	callback(output.path);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const configurationFilename = 'dw.json';

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "fortuneteller" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('fortuneteller.uploadMetaData', function () {
		// The code you place here will be executed every time your command is executed
		vscode.workspace.findFiles(configurationFilename).then(files => {
			if (!files || files.length === 0) {
				vscode.window.showInformationMessage('Fortuneteller: No ' + configurationFilename + ' file found');
				return;
			}

			vscode.workspace.openTextDocument(files[0].path).then((document) => {
				let text = document.getText();
				let configuration = JSON.parse(text);
				const metadataFiles = configuration['metadata-files'];

				if (metadataFiles && metadataFiles.length > 0) {
					vscode.workspace.workspaceFolders.forEach(folder => {
						let targetDirectory = folder.uri.path;
						archiveFiles('site_template', targetDirectory, metadataFiles, function (archivedFilepath) {
							sfcc.auth.auth(configuration['client-id'], configuration['client-secret'], function (err, token) {
								if (err) {
									vscode.window.showInformationMessage('Fortuneteller: Authentication to sandbox failed ' + err);
									return;
								}

								sfcc.instance.upload(configuration.hostname, archivedFilepath, token, {}, function(err) {
									if (err) {
										vscode.window.showInformationMessage('Fortuneteller: Meta data upload error: ' + err);
									} else {
										vscode.window.showInformationMessage('Fortuneteller: Meta data are uploaded');
										// Once the archive is uploaded, remove it from the computer
										deleteFile(archivedFilepath);

										// import data into sandbox
										let archivedFileName = archivedFilepath.replace(/^.*[\\\/]/, '');
										sfcc.instance.import(configuration.hostname, archivedFileName, token, function(err, jobExecutionDetail) {
											if (err) {
												vscode.window.showInformationMessage('Fortuneteller: Meta data import error: ' + err);
											} else {
												vscode.window.showInformationMessage('Fortuneteller: Meta data are being imported (' + jobExecutionDetail.log_file_name + ')');
											}
										});
									}
								});
								vscode.window.showInformationMessage('Fortuneteller: Uploading meta data ...');
							})
						});
					})
				}
						
			});
		})
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}

function deleteFile(path) {
    fs.unlinkSync(path);
}

module.exports = {
	activate,
	deactivate
}
