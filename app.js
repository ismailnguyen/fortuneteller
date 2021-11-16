// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const sfcc = require('sfcc-ci');
const fs = require('fs');
const path = require("path");
const archiver = require('archiver');

function deleteFile(path) {
    fs.unlinkSync(path);
}

function archiveFiles(archiveName, targetDirectory, files) {
    return new Promise(async function (resolve, reject) {
        var output = fs.createWriteStream(path.join(targetDirectory, archiveName + '.zip'));
        var archive = archiver('zip');

        archive.on('error', function(err){
            reject('Error while archiving meta data ' + err);
        });

        archive.pipe(output);

        files.forEach(filepath => {
            let fileName = filepath.replace(/^.*[\\\/]/, '');
            archive.file(targetDirectory + '/' + filepath, { name: 'site_template/meta/' + fileName })
        });
        
        archive.finalize();

        resolve(output.path);
    })
}

function authenticate(instance, clientId, clientSecret) {
    return new Promise(async function (resolve, reject) {
        sfcc.auth.auth(clientId, clientSecret, function (err, token) {
            if (err) {
                reject('Fortuneteller: Authentication to sandbox failed ' + err);
                return;
            }

            resolve(token);
        })
    })
}

function upload(instance, archivedFilepath, token) {
    return new Promise(async function (resolve, reject) {
        sfcc.instance.upload(instance, archivedFilepath, token, {}, function(err) {
            if (err) {
                reject('Fortuneteller: Meta data upload error: ' + err);
                return;
            }

            // import data into sandbox
            let archivedFileName = archivedFilepath.replace(/^.*[\\\/]/, '');
            resolve(archivedFileName);
        });
    });
}

function importMetadata(instance, archivedFileName, token) {
    return new Promise (async function (resolve, reject) {
        sfcc.instance.import(instance, archivedFileName, token, function(err, jobExecutionDetail) {
            if (err) {
                reject('Fortuneteller: Meta data import error: ' + err);
                return;
            }

            resolve(jobExecutionDetail.log_file_name);
        });
    })
}

function readConfigurationFile(configurationFilename) {
    return new Promise (async function (resolve, reject) {
        vscode.workspace.findFiles(configurationFilename).then(files => {
            if (!files || files.length === 0) {
                reject('Fortuneteller: No ' + configurationFilename + ' file found');
                return;
            }

            return vscode.workspace.openTextDocument(files[0].path)
            .then((document) => {
                const text = document.getText();

                resolve(JSON.parse(text));
            });
        })
    })
}

function findMetadataFiles (configuration) {
    return new Promise(async function (resolve, reject) {
        const metadataFiles = configuration['metadata-files'];

        if (!metadataFiles || !metadataFiles.length) {
            reject('Meta data are empty in dw.json');
            return;
        }

        vscode.workspace.workspaceFolders.forEach(folder => {
            let targetDirectory = folder.uri.path;

            resolve({ targetDirectory: targetDirectory, metadataFiles: metadataFiles });
        })
    })
}

function dispose() {
	const configurationFilename = 'dw.json';

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	return vscode.commands.registerCommand('fortuneteller.uploadMetaData', function () {
		// The code you place here will be executed every time your command is executed
        let _configuration = {}, _archivedFilepath = '', _token = '';

        readConfigurationFile(configurationFilename)
        .then(configuration => 
            {
                _configuration = configuration;
                findMetadataFiles(_configuration)
                .then(({ targetDirectory, metadataFiles }) =>
                    {
                        archiveFiles('site_template', targetDirectory, metadataFiles)
                        .then(archivedFilepath =>
                            {
                                _archivedFilepath = archivedFilepath;
                                authenticate(_configuration.hostname, _configuration['client-id'], _configuration['client-secret'],)
                                .then(token =>
                                    {
                                        showInformationMessage('Fortuneteller: Uploading meta data ...');

                                        _token = token;
                                        upload(_configuration.hostname, _archivedFilepath, _token)
                                        .then(archivedFileName =>
                                            {
                                                showInformationMessage('Fortuneteller: Meta data are uploaded');

                                                // Once the archive is uploaded, remove it from the computer
                                                deleteFile(_archivedFilepath);

                                                importMetadata(_configuration.hostname, archivedFileName, _token)
                                                .then(logFileName =>
                                                    {
                                                        showInformationMessage('Fortuneteller: Meta data are being imported (' + logFileName + ')');
                                                    }
                                                ).catch(showInformationMessage)
                                            }
                                        ).catch(showInformationMessage)
                                    }
                                ).catch(showInformationMessage)
                            }
                        ).catch(showInformationMessage)
                    }
                ).catch(showInformationMessage)
            }
        ).catch(showInformationMessage)
	});
}

function showInformationMessage(message) {
    vscode.window.showInformationMessage(message);
}

module.exports = {
	dispose
}
