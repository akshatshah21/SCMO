import React from "react";
import { Link, Route } from "react-router-dom";
import SendShipment from "./SendShipment";
import ReceiveShipment from "./ReceiveShipment";
import IncomingShipments from "./IncomingShipments";
import OutgoingShipments from "./OutgoingShipments";
import Inventory from "./Inventory";

export default function StorageCenter() {
  return (
    <div>
      <h1>Storage Center</h1>
      <Link to="/storage-center/send-shipment">Send Shipment</Link>
      <Link to="/storage-center/receive-shipment">Receive Shipment</Link>
      <Link to="/storage-center/incoming-shipments">Incoming Shipments</Link>
      <Link to="/storage-center/outgoing-shipment">Outgoing Shipments</Link>
      <Link to="/storage-center/inventory">Inventory</Link>

      <Route path="/storage-center/send-shipment" component={SendShipment}/>
      <Route path="/storage-center/receive-shipment" component={ReceiveShipment}/>
      <Route path="/storage-center/incoming-shipments" component={IncomingShipments}/>
      <Route path="/storage-center/outgoing-shipment" component={OutgoingShipments}/>
      <Route path="/storage-center/inventory" component={Inventory}/>

    </div>
  );
}
