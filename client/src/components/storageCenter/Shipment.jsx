import axios from "axios";
import React, { useState, useEffect } from "react";
import M from "materialize-css";
import mapboxgl from "mapbox-gl";
import io from "socket.io-client";
import { connect } from "react-redux";

const ENDPOINT = "http://127.0.0.1:5000"; // localhost. Change this
var map, marker, markerPopup;

markerPopup = new mapboxgl.Popup({ offset: 25 }).setText(
  "Here's the shipment right now"
);

export default function Shipment({
  location: {
    state: { type, shipment },
  },
  auth,
}) {
  const [products, setProducts] = useState([]);
  const [shipmentLocation, setShipmentLocation] = useState({
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    let getProducts = async () => {
      try {
        let res = await axios.get("/api/transfer/" + shipment.id + "/products");
        setProducts(res.data);
      } catch (error) {
        console.log(error);
        M.toast({ html: "Error" });
      }
    };
    getProducts();
  }, [shipment]);

  useEffect(() => {
    console.log("Map effect");
    mapboxgl.accessToken =
      "pk.eyJ1IjoiYWtzaGF0c2hhaDIxIiwiYSI6ImNrZ3Vob2dpNjBvZDgycG5hOHMzbTVxdTMifQ.NXZnqYPxl7x-gp4bNsRRsg";
    map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11", // stylesheet location
      center: [73, 19], // starting position [lng, lat]
      zoom: 7, // starting zoom
    });
  }, [shipment]);

  useEffect(() => {
    const socket = io(ENDPOINT);
    socket.on("connect", () => {
      console.log("SocketIO client connected to server");
      socket.emit("map-client", { transferId: shipment.id });
    });
    socket.on("location-update", (msg) => {
      console.log(msg);
      if (msg) {
        setShipmentLocation(msg);
      }
    });
    return () => socket.disconnect();
  }, [shipment]);

  useEffect(() => {
    if (marker) {
      marker.remove();
    }
    marker = new mapboxgl.Marker({ color: "#ff1744" })
      .setLngLat([shipmentLocation.longitude, shipmentLocation.latitude])
      .setPopup(markerPopup)
      .addTo(map);
  }, [shipmentLocation]);

  return (
    <div className="row" style={{ height: "90vh" }}>
      <div className="col s12 m2 l3 grey lighten-4" style={{ height: "100%" }}>
        <h5 className="center-align text-muted">Details of Transfer</h5>
        <h5>
          <strong>{type === "incoming" ? "From" : "To"}: </strong>
          {shipment.name}
        </h5>
        {/* backend doesn't process stage's address, email so do that and add here later */}
        {shipment.status === "completed" ? (
          <h4 class="center green-text">Completed</h4>
        ) : (
          <h4 class="red-text center">Ongoing</h4>
        )}
        <h5>Products</h5>

        <table>
          <tbody>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
            </tr>
            {products.map((product) => (
              <tr key={product.productId}>
                <td>{product.productName}</td>
                <td>{product.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div id="map" className="col s12 m10 l9" style={{ height: "100%" }}></div>
    </div>
  );
}
