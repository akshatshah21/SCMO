import React, {useEffect, useState} from "react";
import { Link, Route } from "react-router-dom";
import M from "materialize-css";

import AdminMap from "./AdminMap";
import Stats from "./Stats";

export default function Admin() {
  useEffect(() => {
    M.Parallax.init(document.querySelector(".parallax"), {});
  }, []);

  return (
    <>
      <Route exact path="/admin">
        <div className="parallax-container">
          <div className="parallax">
            <img
              src="warehouse.jpg"
              alt="admin"
              className="responsive-img"
            />
          </div>
        </div>
        <h3 className="center-align">Admin Dashboard</h3>
        <div className="row center-align">
          <button className="btn btn-large white">
            <Link to="/admin/map">
              <h5>Map</h5>
            </Link>
          </button>
          <button className="btn btn-large white">
            <Link to="/admin/stats">
              <h5>Numbers and Stats</h5>
            </Link>
          </button>
        </div>
      </Route>
      <Route path="/admin/map" component={AdminMap} />
      <Route path="/admin/stats" component={Stats} />
    </>
  );
}
