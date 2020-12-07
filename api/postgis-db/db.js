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
	  stageId VARCHAR(36) NOT NULL,
	  stageEmail VARCHAR(25),
	  stageAdd TEXT,
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
