import { GET_ERRORS } from "../actionTypes";

const initialState = {};

let errorReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ERRORS: {
      return action.payload;
    }
    default:
      return state;
  }
};

export default errorReducer;