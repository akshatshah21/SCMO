import React from "react";
import { Link, Route } from "react-router-dom";
import SendShipment from "./SendShipment";
import ReceiveShipment from "./ReceiveShipment";
import IncomingShipments from "./IncomingShipments";
import OutgoingShipments from "./OutgoingShipments";
import Inventory from "./Inventory";

export default function StorageCenter() {
  return (
    <div className="container">
      <Route exact path="/storage-center">
        <h1 className="center-align">Storage Center</h1>
        <div className="row center-align">
          <div className="card col s4 offset-s2">
            <Link to="/storage-center/send-shipment"><h5>Send Shipment</h5></Link>
          </div>
          <div className="card col s4">
            <Link to="/receive-shipment"><h5>Receive Shipment</h5></Link>
          </div>
        </div>
        <div className="row center-align">
          <div className="card col s4 offset-s2">
            <Link to="/incoming-shipments"><h5>Incoming Shipments</h5></Link>
          </div>
          <div className="card col s4">
            <Link to="/outgoing-shipment"><h5>Outgoing Shipments</h5></Link>
          </div> 
        </div>
        <div className="row center-align">
          <div className="card col s8 offset-s2">
            <Link to="/inventory"><h5>Inventory</h5></Link>
          </div>
        </div>
      </Route>
      

      <Route path="/storage-center/send-shipment" component={SendShipment}/>
      <Route path="/receive-shipment" component={ReceiveShipment}/>
      <Route path="/incoming-shipments" component={IncomingShipments}/>
      <Route path="/outgoing-shipment" component={OutgoingShipments}/>
      <Route path="/inventory" component={Inventory}/>

    </div>
  );
}
