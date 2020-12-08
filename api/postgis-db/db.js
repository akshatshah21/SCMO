/* PostgreSQL and PostGIS module and connection setup */
const { Pool } = require('pg');

const {
  POSTGIS_DB_USERNAME,
  POSTGIS_DB_PASSWORD,
  POSTGIS_DB_URL,
  POSTGIS_DB_DBNAME,
  POSTGIS_DB_PORT
} = require("../config/keys");

/* SQL to setup the db
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
*/

// Setup connection

module.exports.pool = new Pool({
	user: POSTGIS_DB_USERNAME,
    host: POSTGIS_DB_URL,
    database: POSTGIS_DB_DBNAME,
    password: POSTGIS_DB_PASSWORD,
    port: POSTGIS_DB_PORT
});
