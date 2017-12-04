# Item Catalog

An web application that provides a list of items within a variety of categories.
The back-end consist of a Flask based server with a PostgreSQL data-base.

## Requirements
In order to use this project you need to have **PostgreSQL** installed in your system as some basic understanding on how to use it.

You also need to have Python installed as well as the following libraries:
* [flask](http://flask.pocoo.org/) - Web application microframework
* [sqlalchemy](https://github.com/zzzeek/sqlalchemy) - Database toolkit
* [oauth2client](https://github.com/google/oauth2client) - OAuth 2.0 library
* [httplib2](https://github.com/httplib2/httplib2) - HTTP client library
* [requests](http://docs.python-requests.org/en/master/) - HTTP library

Viewing the catalog doesn't require you to be authenticated, however if you want to create, update and/or delete items you need to authenticate with a [Google account](https://accounts.google.com/SignUp?hl=es).

You will also need to get a Google client id and secret for the application in order to be able to use **Google's OAuth 2.0** services. To get these head to [Google's Developer Console](https://console.developers.google.com) and follow these steps:
* Head to *Credentials > Create credentials > OAuth Client ID*
* Select **Web** application type
* Chose a name for your app
* Add *http://localhost:5000* to Authorized Javascript Origins
* Add *http://localhost:5000/catalog* to Authorized Redirect URIs
* Select create
* Click the Download JSON button, rename the file to **client_secrets.json** and place it in the project's directory


## Installation
1. Clone or download the project folder into your system.
2. Create the application's database through the following command:

    ```
    python3 database_setup.py
    ```

3. Initialize the application's database through the following command:

    ```
    python3 initial_catalog.py
    ```

4. Initialize the application through the following command:

    ```
    python3 server.py
    ```

5. Open the application in your web browser at *http://localhost:5000/*

## Usage
You can view the application catalog without being authenticated, however you will need to authenticate with Google to create, update and/or delete items.
