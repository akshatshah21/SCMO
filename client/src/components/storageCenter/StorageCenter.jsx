import React, { useEffect } from "react";
import { Link, Route } from "react-router-dom";
import M from "materialize-css";

import SendShipment from "./SendShipment";
import Inventory from "./Inventory";
import ShipmentsList from "./ShipmentsList";
import StagesMap from "./StagesMap";

export default function StorageCenter() {
  useEffect(() => {
    M.Parallax.init(document.querySelector(".parallax"), {});
  }, []);

  return (
    <>
      <Route exact path="/storage-center">
        <div className="parallax-container">
          <div className="parallax">
            <img
              src="warehouse.jpg"
              alt="storage-center"
              className="responsive-img"
            />
          </div>
        </div>
        <h3 className="center-align">Storage Center</h3>
        <div className="row center-align">
          <button className="btn btn-large white">
            <Link to="/storage-center/send">
              <h5>Send Shipment</h5>
            </Link>
          </button>
          <button className="btn btn-large white">
            <Link to="/storage-center/incoming">
              <h5>Incoming Shipments</h5>
            </Link>
          </button>
          <button className="btn btn-large white">
            <Link to="/storage-center/outgoing">
              <h5>Outgoing Shipments</h5>
            </Link>
          </button>
          <button className="btn btn-large white">
            <Link to="/storage-center/inventory">
              <h5>Inventory</h5>
            </Link>
          </button>
          <button className="btn btn-large white">
            <Link to="/storage-center/map">
              <h5>Map</h5>
            </Link>
          </button>
        </div>
        
      </Route>
 <Route path="/storage-center/send" component={SendShipment} />
      <Route
        path="/storage-center/incoming"
        render={() => (
          <ShipmentsList title="Incoming Shipments" type="incoming" />
        )}
      />
      <Route
        exact
        path="/storage-center/outgoing"
        render={() => (
          <ShipmentsList title="Outgoing Shipments" type="outgoing" />
        )}
      />
      <Route path="/storage-center/inventory" component={Inventory} />
      <Route path="/storage-center/map" component={StagesMap} />
    </>);
}
