# Change Log

## 1.0.0

Initial release of `fortuneteller` extension.
* Read `dw.json` to parse configuration and get client id, client secret and list of meta data file paths
* Archive all meta data xml files into one .zip archive (using archiver npm package)
* Upload the archived .zip file into the sandbox using sfcc-ci npm package
* Import the uploaded archive file using sfcc-ci npm package
* Inform user with toasts about upload/import status and about errors
* Add explanation on usage in the README
-----------------------------------------------------------------------------------------------------------
## 1.0.1

* Add a icon for the extension
-----------------------------------------------------------------------------------------------------------
## 1.0.2

* Support multi folder workspace
-----------------------------------------------------------------------------------------------------------