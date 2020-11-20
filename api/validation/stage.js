const Validator = require("validator");
const isEmpty = require("is-empty");

const { emptyStringIfUndef } = require("./util");
const e = require("express");

module.exports = {
  validateCreation: (data) => {
    data.stageName = emptyStringIfUndef(data.stageName);
    // Add more validators for other fields not in use right now

    let errors = {};
    if (Validator.isEmpty(data.stageName)) {
      errors.stageName = "Name field required";
    }

    return {
      errors,
      isValid: isEmpty(errors),
    };
  },
  validateProductAddition: (data) => {
    data.stageId = emptyStringIfUndef(data.stageId);
    data.productId = emptyStringIfUndef(data.productId);
    data.quantity = emptyStringIfUndef(data.quantity);
    
    let errors = {};
    if (Validator.isEmpty(data.stageId)) {
      errors.stageId = "Stage ID field required";
    }
    if (Validator.isEmpty(data.productId)) {
      errors.productId = "Product ID field required";
    }
    if (Validator.isEmpty(data.quantity)) {
      errors.productId = "Quantity field required";
    }
    if(!Validator.isNumeric(data.quantity)) {
      errors.quantity = "Quantity should be a number";
    }

    return {
      errors,
      isValid: isEmpty(errors),
    };
  }
};
