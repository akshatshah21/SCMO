const neo4j = require("neo4j-driver");
const {
  NEO4J_DB_URL,
  NEO4J_USERNAME,
  NEO4J_PASSWORD,
} = require("../config/keys");
const driver = neo4j.driver(
  NEO4J_DB_URL,
  neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
);

let session = driver.session({
  database: "neo4j",
});

// Test
/*session.run("MATCH (n) RETURN n;").subscribe({
  onKeys: (keys) => {
    console.log(keys);
  },
  onNext: (record) => {
    record.forEach((entry) => {
      console.log(entry);
      console.log(typeof entry);
    });
  },
  onCompleted: () => {
    session.close(); // returns a Promise
  },
  onError: (error) => {
    console.log(error);
  },
});*/

module.exports = driver;
