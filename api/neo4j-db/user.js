const driver = require("./db");
const bcrypt = require("bcryptjs");


module.exports = {
    /**
     * Add a user as a node in the database
     * @param {Object} user - The details of the user: username, password
    Note: The check of user already existing is already done
     */
    addUser: async (user) => {
        console.log(`Add user: ${user.username} ${user.password}`);
        // TODO
        // info about stage is also required to make the relationship IS_USER_OF.
        try {
            let salt = await bcrypt.genSalt(10);
            let hash = await bcrypt.hash(user.password, salt);
            
            let session = driver.session();
            await session.run("CREATE (u:User { username: $username, password: $password });",
            {
                username: user.username,
                password: hash
            })
            await session.close();
        } catch (err) {
            console.log(`[ERR] addUser(): ${err}`);
        }
    },

    /**
     * Get a user by its username
     * @param {String} username - username of the user
     * @return {Object} - The User Node's properties
     */
    getUserByUsername: async(username) => {
        console.log(`Get user: ${username}`);
        try {
            let session = driver.session();
            let result = await session.run("MATCH (u:User { username: $username }) RETURN u;", 
            {
                username
            });
            let user;
            if(result.records[0]) {
                console.log(result.records[0].get("u").properties);   
                user = result.records[0].get("u").properties;
            }
            await session.close();
            return user;
        } catch (err) {
            console.log(`[ERR] getUserByUsername(): ${err}`);
        }
    },

    /**
     * Remove a user
     * @param {String} username - The username of the user to be removed
     */
    removeUser: async (username) => {
        console.log(`Remove user: ${username}`);
        try {
            let session = driver.session();
            let result = await session.run("MATCH (u:User { username: $username }) DETACH DELETE u;",
            {
                username
            })
        } catch (err) {
            console.log(`[ERR] removeUser(): ${err}`);
        }
    },
};
