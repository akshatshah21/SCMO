/* PostgreSQL and PostGIS module and connection setup */
const { Client } = require('pg');

const {
  POSTGIS_DB_USERNAME,
  POSTGIS_DB_PASSWORD,
  POSTGIS_DB_URL,
  POSTGIS_DB_DBNAME,
} = require("../config/keys");

/* SQL to setup the db
CREATE TABLE Stage
	(
	  stageId character varying(36) NOT NULL,
	  lat numeric,
	  lon numeric,
	  geom geometry(POINT,4326)
	);

CREATE TABLE Transfer
	(
	  transferId character varying(36) NOT NULL,
	  sourceId character varying(36) NOT NULL,
	  destinationId character varying(36) NOT NULL,
	  lat numeric,
	  lon numeric,
	  geom geometry(POINT,4326)
	);
*/

// Setup connection
var username = POSTGIS_DB_USERNAME; // sandbox username
var password = POSTGIS_DB_PASSWORD; // read only privileges on our table
var host = POSTGIS_DB_URL; 
var database = POSTGIS_DB_DBNAME; // database name
var conString = "postgres://"+username+":"+password+"@"+host+"/"+database; // Your Database Connection

module.exports.Client = () => {
	return new Client(conString);
}
