import axios from "axios";
import jwt_decode from "jwt-decode";
import { API_URL } from "../../config/options";

import setAuthToken from "../../utils/setAuthToken";
import { GET_ERRORS, SET_CURRENT_USER, USER_LOADING } from "../actionTypes";

export const registerUser = (userData, history) => (dispatch) => {
  axios
    .post(API_URL + "/api/auth/register", userData)
    .then((res) => history.push("/auth/login"))
    .catch((err) => {
      console.log(err.response.data);
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      });
    });
};

export const loginUser = (userData) => (dispatch) => {
  axios
    .post(API_URL + "/api/auth/login", userData)
    .then((res) => {
      const { token } = res.data;
      localStorage.setItem("jwt", token);
      setAuthToken(token);
      const decoded = jwt_decode(token);
      dispatch(setCurrentUser(decoded));
    })
    .catch((err) => {
      console.log(err.response.data);
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      });
    });
};

export const setCurrentUser = (decoded) => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded,
  };
};

export const logoutUser = () => (dispatch) => {
  localStorage.removeItem("jwt");
  setAuthToken(false);
  dispatch(setCurrentUser({}));
};
