const neo4j = require("neo4j-driver");
const {
  NEO4J_DB_URL,
  NEO4J_USERNAME,
  NEO4J_PASSWORD,
} = require("../config/keys");
const driver = neo4j.driver(
  NEO4J_DB_URL,
  neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD),
  { disableLosslessIntegers: true }
);

module.exports = driver;
