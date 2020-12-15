const driver = require("./db");
const bcrypt = require("bcryptjs");


module.exports = {
  /**
   * Add a user as a node in the database
   * @param {Object} user - The details of the user: username, password
   */
  addUser: async (user) => {
    // console.log(`Add user ${user.username}`);
    try {
      let salt = await bcrypt.genSalt(10);
      let hash = await bcrypt.hash(user.password, salt);

      let session = driver.session();
      if(user.type === "stage") {
        let result = await session.run(
          "MATCH (s: Stage { stageId: $stageId }) " +
            "WHERE NOT (s)<-[:IS_USER_OF]-(:User) " +
            "WITH s " +
            "MERGE (s)<-[:IS_USER_OF]-(u: User { " +
            "username: $username," +
            "password: $password," +
            "type: $type" +
            "}) " +
            "RETURN u;",
          {
            username: user.username,
            password: hash,
            type: user.type,
            stageId: user.stageId,
          }
        );
        if(result.records.length == 0) {
          throw Error("Stage ID is invalid")
        }
      } else if(user.type === "admin") {
        await session.run(
          "CREATE (u:User { " +
            "type: $type," +
            "username: $username," +
            "password: $password" +
          "});",
          {
            username: user.username,
            password: hash,
            type: user.type
          }
        );
      }
      
      await session.close();
      
      return "OK";
    } catch (err) {
      console.log(`[ERR] addUser(): ${err}`);
      return { stageId: "Invalid input" }; // always stage id error for now
    }
  },

  /**
   * Get a user by its username along with the ID of the user's stage
   * @param {String} username - username of the user
   * @return {Object} The User Node's properties
   */
  getStageUserByUsername: async (username) => {
    // console.log(`Get user: ${username}`);
    try {
      let session = driver.session();
      let result = await session.run(
        "MATCH (u: User { username: $username })-[:IS_USER_OF]->(s:Stage) " + 
        "RETURN u, s;",
        {
          username,
        }
      );
      let user;
      if (result.records[0]) {
        user = result.records[0].get("u").properties;
        user.stageId = result.records[0].get("s").properties.stageId;
      }
      await session.close();
      return user;
    } catch (err) {
      console.log(`[ERR] getUserByUsername(): ${err}`);
    }
  },

  /**
   * Get an admin user by its username
   * @param {String} username - username of the user
   * @return {Object} The User Node's properties
   */
  getAdminByUsername: async (username) => {
    try {
      let session = driver.session();
      let result = await session.run(
        "MATCH (u: User { username: $username })" + 
        "RETURN u;",
        {
          username,
        }
      );
      let user;
      if (result.records[0]) {
        user = result.records[0].get("u").properties;
      }
      await session.close();
      return user;
    } catch (err) {
      console.log(`[ERR] getAdminByUsername(): ${err}`);
    }
  },

  /**
   * Remove a user
   * @param {String} username - The username of the user to be removed
   */
  removeUser: async (username) => {
    // console.log(`Remove user: ${username}`);
    try {
      let session = driver.session();
      let result = await session.run(
        "MATCH (u:User { username: $username }) DETACH DELETE u;",
        {
          username,
        }
      );
      await session.close();
    } catch (err) {
      console.log(`[ERR] removeUser(): ${err}`);
    }
  },
};
