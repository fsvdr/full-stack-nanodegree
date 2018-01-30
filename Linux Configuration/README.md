# Linux Server Configuration ⚙️

Configuring an Ubuntu server from zero to run a python web application.

# Check it out 🔍

* IP Address: 188.166.36.83
* Public URL: http://188.166.36.83

# Requirements
In order to configure a Linux server you first need, well... a *server*. For this project I decided to go with a [Digital Ocean](http://digitalocean.com/) Droplet running **Ubuntu (16.04.3 x64)** but you should be able to run this same instructions anywhere else.

# Installation
Once you've got your shiny new **Linux** server initiate an **SSH** session to it with the default credentials that your server came with (if any).

## Secure your server 🔐
1. Update all currently installed packages by running:

    ```
    apt-get update
    apt-get upgrade
    ```
2. Change the **SSH port** from *22* to *2200*

    ```
    # Open the SSH configuration file
    nano /etc/ssh/sshd_config

    # Change this line:
    # Port 22
    # To this:
    # Port 2200

    # Save and exit

    # Restart the service
    service ssh restart
    ```

3. Configure the **Uncomplicated Firewall (UFW)** to allow incoming connections for *SSH (2200)*, *HTTP (80)* and *NTP(123)*

    ```
    # Check the current status of the UFW
    ufw status

    # Default to deny incoming connections and allow outgoing ones
    ufw default deny incoming
    ufw default allow outgoing

    # Allow the specified connections
    ufw allow 2200/tcp
    ufw allow www
    ufw allow ntp

    # Enable the UFW
    ufw enable
    ```

## Give grader access 🔑
1. Create a new user account named *grader*
    ```
    adduser grader

    # Provide some info and a password
    ```

2. Give grader the permission to **sudo**.

    The `sudoers.d` directory contains the files (usually given the name of each user) that contain the *sudo* permissions.

    ```
    # Create a sudoer file for grader
    touch /etc/sudoers.d/grader

    # Write the permission
    nano /etc/suders.d/grader

    # Write the following line:
    # grader ALL=(ALL) NOPASSWD:ALL

    # Save and exit
    ```

3. Create an **SSH key pair** for grader

    Create the keys on a local computer (**not on the server**).

    ```
    # Create the keys using a fake email as comment
    ssh-keygen -C grader@udacity.com

    # Follow the tool instructions
    ```

    Then, **back on the server** create the directory and file to store the user's authorized keys.

    ```
    mkdir /home/grader/.ssh
    touch /home/grader/ssh/authorized_keys

    # Change both, directory and file, permissions to the grader user
    chmod 700 /home/grader/.ssh
    chmod 644 /home/grader/.ssh/authorized_keys

    # Change both, directory and file, ownership to the grader user
    chown grader /home/grader/.ssh
    chown grader /home/grader/.ssh/authorized_keys
    ```

    On the **local computer**, copy the public key contents

    ```
    cat wherever/the/key/is/stored/key.pub

    # Copy the contents
    ```

    Now, we paste it in the `authorized_keys` file

    ```
    nano /home/grader/.ssh/authorized_keys

    # Paste the public key, save and exit

    # Restart the ssh service
    service ssh restart
    ```

## No more **root** 🚪
So far we've been working as the root user which is bad practice but allowed this *'tutorial'* to be followed in this specific order (which I think is easier to understand). Now that we know how to create users and ssh keys, we can go ahead and create those for ourselves and disable both **password authentication** and **root login**

```
# Make sure that you can login using SSH keys before continuing since this
# will prevent you from logging in using passwords and as root

nano /etc/ssh/sshd_config

# Change this line:
# PasswordAuthentication yes
# To this:
# PasswordAuthentication no

# Also, change this:
# PermitRootLogin yes
# To this:
# PermitRootLogin no

# Close the session and log back in with your own user or as grader
```

**Important:** As of this point, every command is assumed to be issued from your personal user (or grader).

## Prepare to deploy your project 🚀
1. Configure the local timezone to UTC

    `sudo timedatectl set-timezone UTC`

2. Install and configure **Apache server** to serve a **WSGI** Python app.

    ```
    # Install Apache
    sudo apt-get install apache2

    # Install WSGI for Python 3
    sudo apt-get install libapache2-mod-wsgi-py3

    # Enable the WSGI module
    sudo a2enmod wsgi
    ```

    In order to check if everything's working correctly you can open your server's address in a browser and the Apache's default page should display.

    Now, to test that WSGI is working:

    ```
    # Open the apache's default site configuration file
    sudo nano /etc/apache2/sites-enabled/000-default.conf

    # Right before the </VirtualHost> closing tag, wirte the following:
    # WSGIScriptAlias / /var/www/html/hello.wsgi
    ```

    👆 This tells apache to serve a `hello.wsgi` app whenever the / route is requested. So go ahead and write that app:

    ```
    # Create the app file
    sudo touch /var/www/html/hello.wsgi

    # Now add the simplest app to it
    sudo nano /var/www/html/hello.wsgi

    # Which is this:
    def application(environ, start_response):
        status = '200 OK'
        output = b'Hello Humans!'

        response_headers = [('Content-type', 'text/plain'$
        start_response(status, response_headers)

        return [output]

    # Now restart the apache server
    sudo apache2ctl restart
    ```

    If you reload the page in your browser and see the 'Hello Humans!' message, you're good to go.

3. Install **PostgreSQL**
    ```
    sudo apt-get install postgresql
    ```

4. Install **Git**
    ```
    sudo apt-get install git
    ```

## Deploy the Item Catalog Project 🖥

1. Clone the project (*Note that this will be different depending on your project*)
    ```
    sudo git clone https://github.com/fsvdr/full-stack-nanodegree.git /var/www/

    cd /var/www/full-stack-nanodegree
    ```

    Now, here we modify a bit our folder structure to resemble that of [this post](https://www.digitalocean.com/community/tutorials/how-to-deploy-a-flask-application-on-an-ubuntu-vps) just to follow some convention on how to organize a Flask app. So the actual contents of this directory will look something like:

    ```
    /full-stack-nanodegree
        /ItemCatalogApp
            database_setup.py
            initial_catalog.py
            /ItemCatalogApp
                /static
                /templates
                __init__.py
    ```
2. Create a virtual environment
    Set up a *virtual environment* in order to keep the application and its dependencies isolated from the main system:

    ```
    # Install PIP for Python 3
    sudo apt-get install python3-pip

    sudo pip3 install virtualenv

    # Create environment
    sudo virtualenv venv

    # Activate the environment
    source venv/bin/activate
    ```

    Now, install the project dependencies. For this one:

    ```
    sudo -H pip3 install Flask
    sudo -H pip3 install sqlalchemy
    sudo -H pip3 install oauth2client
    sudo -H pip3 install httplib2
    sudo -H pip3 install requests
    sudo -H pip3 install psycopg2
    ```

    Now we need to tell Apache about our app

    ```
    # Create the site configuration file
    sudo nano /etc/apache2/sites-available/ItemCatalogApp.conf

    # Add the following to the config file

    <VirtualHost *:80>
		ServerName mywebsite.com
		ServerAdmin admin@mywebsite.com

		WSGIScriptAlias / /var/www/full-stack-nanodegree/ItemCatalogApp/ItemCatalogApp/itemcatalog.wsgi

		<Directory /var/www/full-stack-nanodegree/ItemCatalogApp/ItemCatalogApp
			Order allow,deny
			Allow from all
		</Directory>

		Alias /static /var/www/full-stack-nanodegree/ItemCatalogApp/ItemCatalogApp/static

		<Directory /var/www/full-stack-nanodegree/ItemCatalogApp/ItemCatalogApp/static/>
			Order allow,deny
			Allow from all
		</Directory>
		ErrorLog ${APACHE_LOG_DIR}/error.log
		LogLevel warn
		CustomLog ${APACHE_LOG_DIR}/access.log combined
    </VirtualHost>

    # Save and exit

    # Enable the virtual host
    sudo a2ensite ItemCatalogApp

    # Disable the default site
    sudo a2dissite 000-default

    # Reload Apache to apply changes
    sudo service apache2 reload
    ```

3. Creating the WSGI application
    Bare with me, we're almost there. Next up is creating the application entry point (a WSGI file)

    ```
    # Inside /var/www/full-stack-nanodegree/ItemCatalogApp
    sudo nano itemcatalog.wsgi

    # Edit the file width the following:
        #!/usr/bin/python
        import sys
        import logging
        logging.basicConfig(stream=sys.stderr)
        sys.path.insert(0,"/var/www/full-stack-nanodegree/ItemCatalogApp/")

        activate_this = '/var/www/full-stack-nanodegree/ItemCatalogApp/ItemCatalogApp/venv/bin/activate_this.py'
        with open(activate_this) as file:
        exec(file.read(), dict(__file__=activate_this))

        from ItemCatalogApp import app as application
        application.secret_key = 'some not so secret secret'
    ```

    Finally, restart the apache server:

    `sudo service apache2 restart`

4. Modify the application
    Now, in the original version of the Item Catalog project, the database was handled by SQLite, however, now we can use PostgreSQL and for that we need to modify some files.

    We'll start by creating the PostgreSQL database

    ```
    # Log into a postgres psql session
    sudo -u postgres psql

    # Let's create some credentials to log into the database
    CREATE ROLE catalog WITH PASSWORD item-catalog-passwd;

    # Create the database
    CREATE DATABASE catalog;
    ```

    Next, we'll need to change every `create_engine('sqlite:///catalog.db')` line in our Python app to `create_engine('postgresql://catalog:item-catalog-passwd@localhost/catalog')`.

    Now we can populate the database running the `database_setup` and `initial_catalog` scripts

    ```
    sudo python3 database_setup.py
    sudo python3 initial_catalog.py
    ```

    Finally, don't forget to get you'r **Google API Keys** and place those in `/var/www/full-stack-nanodegree/ItemCatalogApp/ItemCatalogApp/client_secrets.json`

    If everything works as expected, you should now be able to visit the application in your browser.



    You've made it! 👏👏🙌😃

## Resources that made this possible 📖
The [How To Deploy a Flask Application on an Ubuntu VPS ](https://www.digitalocean.com/community/tutorials/how-to-deploy-a-flask-application-on-an-ubuntu-vps) post by **Digital Ocean** was a huge life saver.

Also, a lot of **StackOverflow** threads that now are lost in my browsing history.

I also want to mention [Steve Wooding](https://github.com/SteveWooding/fullstack-nanodegree-linux-server-config) and [Ahmed Cherif](https://github.com/RoyalFlush24/Linux-Server-Configuration) whose project READMEs helped me find a way out of the desperation.

Also, the FSND Slack channel community's help was a major resource to get this out there.
