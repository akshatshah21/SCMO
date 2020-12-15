# Project Setup
These instructions assume an Ubuntu system. 
## Prerequisites
### Nodejs
Install Nodejs LTS version:
1. [Via package managers](https://nodejs.org/en/download/package-manager/)
2. [Installers and Binaries for Linux, Windows and macOS](https://nodejs.org/en/download/)
### Neo4j
Either install [Neo4j server](https://neo4j.com/download-center/?ref=web-product-database/#community) (which then runs as a service), or install [Neo4j Desktop](https://neo4j.com/download-v2/?ref=product). __Don't install both of them__. For GUI control of different databases, install [Neo4j Desktop](https://neo4j.com/download-v2/?ref=product).  
Note that Java 11 is a prerequisite for Neo4j. Install it from [OpenJDK](https://openjdk.java.net/install/index.html).  

#### Java 11
1. Use the following commands. Note that the installation commands for Neo4j will install Java 11.
```
sudo add-apt-repository -y ppa:openjdk-r/ppa
sudo apt-get update
```
2. Make sure that Java points to the correct verion:
```
sudo update-java-alternatives --jre --set <java11name>
```
#### Neo4j Server (Community Edition)
1. Add the repository
```
wget -O - https://debian.neo4j.com/neotechnology.gpg.key | sudo apt-key add -
echo 'deb https://debian.neo4j.com stable latest' | sudo tee -a /etc/apt/sources.list.d/neo4j.list
sudo apt-get update
```
2. Install Neo4j Community Edition
```
sudo apt-get install neo4j=1:4.2.1
```
3. Start Neo4j service
```
sudo service neo4j start
```
4. Test whether Neo4j is running by going to `http://localhost:7474`
#### Neo4j Desktop
1. Install the AppImage file from https://neo4j.com/download-v2/?ref=product  
2. Make the AppImage file executable by
```
sudo chmod +x <name of file>
```
3. Run the AppImage file
4. When Neo4j Desktop opens, create a new database and start it
### PostgreSQL 12
#### Debian/Ubuntu
1. Add the repository
```
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" |sudo tee  /etc/apt/sources.list.d/pgdg.list
```
2. Install PostgreSQL
```
sudo apt update
sudo apt -y install postgresql-12 postgresql-client-12
```
3. During this installation, a `postgres` user is created automatically. Change to the `postgres` user by:
```
sudo -su postgres
```
4. Reset the password:
```
psql -c "alter user postgres with password 'password'"
```
5. Start `psql` prompt
```
psql
```
6.  `CREATE` a database and connect to it using `\c`.
7. Optionally, install pgAdmin 4.
```
sudo apt install pgadmin4 pgadmin4-apache2
```
During installation, set the username and password for pgAdmin. Check if the set up is working properly by going to `localhost/pgadmin` from the browser.  
Log in and add a server, and connect it to port `5432`. Also specify connection details in the Connection tab while adding a new server.
### PostGIS 3
1. Install PostGIS 3
```
sudo apt install postgis postgresql-12-postgis-3
```
2. Create a template database:
```
sudo -su postgres
createdb template_postgis
psql -d template_postgis -c "CREATE EXTENSION postgis;"
psql -d template_postgis -c "CREATE EXTENSION postgis_topology;"
psql -d template_postgis -c "CREATE EXTENSION postgis_sfcgal;"
```
Mark this database as a template:
```
psql -d template_postgis -c "UPDATE pg_database SET datistemplate = 'true' WHERE datname = 'template_postgis';"
```


## Installation of the Project
1. Clone this repository using `git clone` or `gh clone repo`.
2. Move to the api directory. Install all dependencies:
```
npm i
```
3. Move to the client directory. Install all dependencies:
```
npm i
```
4. Edit details in the file `api/config/keys.js`. 
5. Edit details in the file `client/src/config/keys.js`.
6. If you want, edit details in the file `api/config/options.js`.
7. Edit details in the file `client/src/config/options.js`.
8. Set up a PostgreSQL database instance.
### SQL Queries to Create the Database.
```
CREATE TABLE Stage
	(
	  stageId VARCHAR(36) NOT NULL,
	  stageLat numeric,
	  stageLon numeric,
	  stageGeom geometry(POINT,4326)
	);

CREATE TABLE Transfer
	(
	  transferId VARCHAR(36) NOT NULL,
	  sourceId VARCHAR(36) NOT NULL,
	  destinationId VARCHAR(36) NOT NULL,
	  transferLat numeric,
	  transferLon numeric,
	  transferGeom geometry(POINT,4326)
	);
```
## Running the project for development
1. Make sure that both database instances are running
2. Run the api.
```
node api/app.js
```
3. Run the React app
```
cd client
npm start
```
4. Go to `http://localhost:3000`
5. Note that certain functions require the Android App associated with this project. See [this](https://github.com/akshatshah21/Android-Location-Tracking) repo.
## Serving the React app in production mode 
1. Since this project uses Create-React-App, simply run `npm run build` in `client/`.
2. Serve these files using Express itself using the `static` middleware, or use another server, like Nginx. To use Nginx:
  * Install nginx:
  ```
  wget --quiet http://nginx.org/keys/nginx_signing.key && sudo apt-key add nginx_signing.key
  sudo apt update
  sudo apt install nginx
  ```
  * Check whether the nginx service is running. If it isn't, restart it. 
  ```
  sudo systemctl status nginx
  sudo systemctl enable nginx
  sudo systemctl status nginx
  ```
  * If another process is using port 80, you will get an error. Disable any processes or services that are using port 80 (a common service is apache2 - `sudo service apache2 stop`) 
  * Create a directory `scmo.lan/` in `/var/www/`
  * Move the `build` directory in `client/` to `/var/www/scmo.lan`.
  * Go to `/etc/nginx/conf.d`. Create a `scmo.conf` file, and enter the following configuration in it.
  ```nginx
  server {
    listen 80; # IPv4
	listen [::]:80; #IPv6
    
    # scmo.lan is the domain name
    server_name app.scmo.lan;

    # Root dir for static files
	root /var/www/scmo.lan/build/;
	index index.html;

    # Forward API requests to the backend API, running at port 5000
    location /api/ {
        proxy_set_header   X-Forwarded-For $remote_addr;
        proxy_set_header   Host $http_host;
		proxy_pass         http://192.168.29.2:5000/;
    }
    
    # Serve static files from the scmo.lan/build directory
	location / {
		try_files $uri /$uri /index.html;
	}
}

  ```
  * Add the following line in the `/etc/hosts` file:
  ```
  <YOUR_IP_ADDRESS> app.scmo.lan
  ```
  * The application should be served now when you go to `http://app.scmo.lan/`