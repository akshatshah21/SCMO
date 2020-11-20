const isEmpty = require("is-empty");

module.exports = {
  emptyStringIfUndef: (value) => {
    return !isEmpty(value) ? value : "";
  }
}