import axios from 'axios';
import React, { useEffect, useState } from 'react'

import ShipmentCard from "./ShipmentCard";

export default function ShipmentsList(props) {
  const [shipments, setShipments] = useState([]);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    const getShipments = async() => {
      console.log("HELLO")
      // use props.type == "incoming" or "outgoing" to know which type
      // use ID from redux state and use it in request
      // let res = await axios.get("/api/transfer"); // something like this

      // Dummy
      let res = await axios.get("https://jsonplaceholder.typicode.com/users");
      setShipments(res.data.map(shipment => ({
        id: shipment.id,
        recipient: shipment.name,
        products: "Apples, Bananas, Cashewnuts?, ...",
        start: "Nov 12, 2:53 PM"
      })));
    }
    getShipments();
  }, [pending]);
  return (
    <div>
      <h2 className="center-align">{props.title}</h2>
      <div className="row" style={{ marginTop: "1.5rem" }}>
        <nav className="nav-extended col s12 row indigo darken-4">
            <ul className="row tabs tabs-transparent">
              <li
                className="col s6 tab waves-effect waves-light"
                onClick={() => setPending(true)}
                style={{ borderBottom: pending ? "white 2px solid" : "none" }}
              >
                <span>Pending</span>
              </li>
              <li
                className="col s6 tab waves-effect waves-light"
                onClick={() => setPending(false)}
                style={{ borderBottom: pending ? "none" : "white 2px solid" }}
              >
                <span>Completed</span>
              </li>
            </ul>
        </nav>
      </div>
      { shipments.map(shipment => <ShipmentCard key={shipment.id} shipment={shipment} />) }
    </div>
  )
}
