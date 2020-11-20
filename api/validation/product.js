const Validator = require("validator");
const isEmpty = require("is-empty");

const { emptyStringIfUndef } = require("./util");

module.exports = {

  /**
   * Validates product creation form data
   * @param {Object} data - Product fields
   * @return {Object} An object with boolean isValid, and errors if any
   */
  validateCreation: (data) => {
    let errors = {};
    data.productName = emptyStringIfUndef(data.productName);
    data.mrp = emptyStringIfUndef(data.mrp);

    // productName check
    if (Validator.isEmpty(data.productName)) {
      errors.productName = "Product Name field is required";
    }

    // mrp check
    if (Validator.isEmpty(data.mrp)) {
      errors.mrp = "MRP field is required";
    } else if (!Validator.isNumeric(data.mrp)) {
      errors.mrp = "MRP must be numeric";
    }

    return {
      errors,
      isValid: isEmpty(errors),
    };
  },
};
