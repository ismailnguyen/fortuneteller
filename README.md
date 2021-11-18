# fortuneteller
Salesforce Commerce Cloud aka SFCC/Demandware meta data uploader VS Code extension

## Features
* Upload and import meta datas with one command

## Usage

After installing the extension, open the Command Palette and type `Fortuneteller: Upload meta data` (Ctrl+Shift+P in Windows, Cmd+Shift+P in Mac OS).
You should see toasts appearing and informing you about the status of upload and import of meta datas.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.
- SFCC developer sandbox with admin rights
- API user with client id and secret (created from Salesforce's Account Manager)
- VSCode version > v1.62.2
- A code workspace with a dw.json file
- SFCC developer sandbox
- Internet connection
- Electricity (otherwise your computer will shut down)

## Setup

### Sandbox permissions (WebDAV and OCAPI)
In order to allow `fortuneteller` to upload the metadata into the sandbox (using WebDAV), and import the metadata by executing the out of the box SFCC job `sfcc-site-archive-import`, you need to give permission to the previously created API user (cf. Requirements).

#### WebDAV permissions
In your sandbox, under `Administration > Organization > WebDAV Client Permissions`, use the following snippet by replacing `my_client_id` with your API user's client ID. Note, if you already have WebDAV Client Permissions configured, e.g. for other API keys, you have to merge this permission set into the existing list of permission sets for the other clients.

```json
{
   "clients":[
      {
         "client_id": "my_client_id",
         "permissions":[
            {
               "operations":[
                  "read_write"
               ],
               "path": "/impex"
            }
         ]
      }
   ]
}
```

#### OCAPI settings
In your sandbox, under `Administration > Site Development > Open Commerce API Settings`, use the following snippet by replacing `my_client_id` with your API user's client ID. Note, if you already have Open Commerce API Settings configured, e.g. for other API keys, you have to merge this permission set into the existing list of permission sets for the other clients.

```json
{
   "_v": "19.5",
   "clients":[
      {
         "client_id": "my_client_id",
         "resources":[
            {
               "resource_id": "/jobs/*/executions",
               "methods":[
                  "post"
               ],
               "read_attributes": "(**)",
               "write_attributes": "(**)"
            },
            {
               "resource_id": "/jobs/*/executions/*",
               "methods":[
                  "get"
               ],
               "read_attributes": "(**)",
               "write_attributes": "(**)"
            }
         ]
      }
   ]
}
```

### Extension settings
Create (if not already exists) a `dw.json` inside your code workspace using the following snippet by replacing `my_client_id` with your API user's client ID and `my_client_secret` with your API user's client secret. Note, if you already have a `dw.json` in your workspace, e.g. for cartridges upload with Prophet extension, you have to merge this configuration into the existing `dw.json`.
```json
{
    "client-id": "my_client_id",
    "client-secret": "my_client_secret",
    "metadata-files": [
        "myFirstProject/site_template/meta/system-objecttype-extensions.xml",
        "myFirstProject/site_template/meta/system-objecttype-extensions.xml",
        "test-repo/data/meta/custom-objecttype-extensions.xml",
        "anotherProject/custom-objecttype-definitions.xml",
        "as many paths to meta data files in this array"
    ]
}
```

## Known Issues

Nothing yet.
Please post them into 

## Release Notes

See [Changelog](https://github.com/ismailnguyen/fortuneteller/blob/main/CHANGELOG.md)



