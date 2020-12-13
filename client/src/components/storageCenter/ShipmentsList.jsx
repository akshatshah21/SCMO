import axios from "axios";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import M from "materialize-css";

import ShipmentCard from "./ShipmentCard";
import { API_URL } from "../../config/options";

function ShipmentsList({ history, title, type, auth }) {
  const [shipments, setShipments] = useState([]);
  const [ongoing, setOngoing] = useState(true);
  const [code, setCode] = useState("");

  useEffect(() => {
    const getShipments = async () => {
      let url = API_URL + `/api/transfer/${auth.user.stageId}/` + type;
      let res = await axios(url);
      console.log(res.data);
      let shipments;
      if(type === "incoming") {
        // not using res.data.pending shipments for now
        shipments = [...res.data.ongoing, ...res.data.completed];
        console.log(shipments);
      } else {
        shipments = res.data;
      }
      setShipments(
        shipments.map((transfer) => ({
          id: transfer.transferId,
          status: transfer.transferStatus,
          name: (transfer.sourceName === auth.user.stage.stageName ? transfer.destinationName : transfer.sourceName)
        }))
      );
    };
    getShipments();
  }, [ongoing, type, auth]);

  useEffect(() => {
    var elems = document.querySelectorAll(".modal");
    var [instance] = M.Modal.init(elems, {
      onCloseEnd: () => {
        // display done and redirect to storage center
        M.toast({ html: "Shipment received" });
        setOngoing(false);
      },
    });
    if (instance) instance.open();
  }, [code]);

  const handleReceiveClick = async (id) => {
    let res = await axios.post(API_URL + "/api/transfer/finish", {
      transferId: id,
      stageId: auth.user.stageId
    });
    if(res.status === 200) {
      setCode(res.data.destinationCode);
    } else {
      M.toast({html: `Error: ${res.data.error}`});
    }
  }

  return (
    <div className="container">
      <h2 className="center-align">{title}</h2>
      {ongoing && <h5 className="center-align">Sorted by distance</h5>}
      <div className="row" style={{ marginTop: "1.5rem" }}>
        <nav className="nav-extended col s12 row indigo darken-4">
          <ul className="row tabs tabs-transparent">
            <li
              className="col s6 tab waves-effect waves-light"
              onClick={() => setOngoing(true)}
              style={{ borderBottom: ongoing ? "white 2px solid" : "none" }}
            >
              <span>Ongoing</span>
            </li>
            <li
              className="col s6 tab waves-effect waves-light"
              onClick={() => setOngoing(false)}
              style={{ borderBottom: ongoing ? "none" : "white 2px solid" }}
            >
              <span>Completed</span>
            </li>
          </ul>
        </nav>
      </div>
      {shipments
        .filter(
          (shipment) => shipment.status === (ongoing ? "ongoing" : "completed")
        )
        .map((shipment) => (
          <ShipmentCard key={shipment.id} shipment={shipment} type={type} receiveClick={handleReceiveClick} />
        ))}

      {code !== "" ? (
        <div id="modal1" className="modal">
          <div className="modal-content">
            <h4>Receive Shipment</h4>
            <h5>
              To complete the shipment, give this code to the person in charge of
              moving the products to you.
            </h5>
            <h2 className="center-align">{code}</h2>
          </div>
          <div className="modal-footer">
            <a
              href="#!"
              className="modal-close waves-effect waves-green btn-flat"
            >
              Done
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, null)(ShipmentsList);
