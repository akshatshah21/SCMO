import { SET_CURRENT_USER, USER_LOADING } from "../actionTypes";

const isEmpty = require("is-empty");

const initialState = {
  isAuthenticated: false,
  user: {},
  loading: false,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CURRENT_USER: {
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !isEmpty(action.payload),
      };
    }
    case USER_LOADING: {
      return {
        ...state,
        loading: true,
      };
    }
    default:
      return state;
  }
};

export default authReducer;