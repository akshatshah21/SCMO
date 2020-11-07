import driver from "./db.js";

module.exports = {
    /**
     * Add a user as a node in the database
     * @param1 {String} username - The username of the user
     * @param2 {String} password - The password of the user
     */
    addUser: (username, password) => {
        console.log(`Add user: ${username} ${password}`);
        // TODO
        // The check of user already existing is already done
        // Hash password before saving
        // May need to change signature to allow an object instead of (username, password), since info about stage is also required to make the relationship IS_USER_OF.
    },

    /**
     * Get a user by its username
     * @param {String} username - username of the user
     * @return {Object} - The User Node object
     */
    getUserByUsername: (username) => {
        console.log(`Get user: ${username}`);
    },

    /**
     * Get a user by its id
     * @param {Number} id - The id of the user
     * @return {Object} - The User Node object
     */
    getUserById: (id) => {},

    /**
     * Remove a user
     * @param {Number} id - The id of the user to be removed
     */
    removeUser: (id) => {
        console.log(`Remove user: ${id}`);
    },
};
