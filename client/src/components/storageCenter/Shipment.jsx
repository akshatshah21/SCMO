import axios from "axios";
import React, { useState, useEffect } from "react";
import M from "materialize-css";
import mapboxgl, { Marker, Popup } from "mapbox-gl";
import io from "socket.io-client";
import { MAPBOX_API_TOKEN } from "../../config/keys";
import {
  MAPBOX_STYLESHEET_LOCATION,
  MAPBOX_START_ZOOM,
  MAPBOX_START_CENTER,
  SOCKETIO_URL,
  API_URL,
} from "../../config/options";

const ENDPOINT = SOCKETIO_URL; // localhost. Change this
var map;
var shipmentPopup = new Popup({ offset: 25 }).setText(
  "Here's the shipment right now"
);

export default function Shipment({
  location: {
    state: { type, shipmentId },
  },
}) {
  const [shipmentDetails, setShipmentDetails] = useState({});
  const [products, setProducts] = useState([]);
  const [shipmentLocation, setShipmentLocation] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [shipmentMarker, setShipmentMarker] = useState();
  const [sourceMarker, setSourceMarker] = useState();
  const [destinationMarker, setDestinationMarker] = useState();

  useEffect(() => {
    let getTransfer = async () => {
      try {
        let {data: transfer} = await axios.get(API_URL + "/api/transfer/" + shipmentId + "/details");
        console.log(transfer);

        transfer.transferStartTime = `${transfer.transferStartTime.day}/${transfer.transferStartTime.month}/${transfer.transferStartTime.year} ${transfer.transferStartTime.hour}:${transfer.transferStartTime.minute}`;
        if (transfer.transferEndTime) {
          transfer.transferEndTime = `${transfer.transferEndTime.day}/${transfer.transferEndTime.month}/${transfer.transferEndTime.year} ${transfer.transferEndTime.hour}:${transfer.transferEndTime.minute}`;
        } else {
          transfer.transferEndTime = "NA";
        }

        setShipmentDetails({
          sourceName: transfer.source.stageName,
          destinationName: transfer.destination.stageName,
          sourceEmail: transfer.source.stageEmail,
          destinationEmail: transfer.destination.stageEmail,
          sourceLocation: transfer.source.location,
          destinationLocation: transfer.destination.location,
          sourceAddress: transfer.source.stageAdd,
          destinationAddress: transfer.destination.stageAdd,
          status: transfer.transferStatus,
          startTime: transfer.transferStartTime,
          endTime: transfer.transferEndTime,
        });
        setProducts(transfer.products);
      } catch (error) {
        console.log(error);
        M.toast({ html: "Error" });
      }
    };
    getTransfer();
  }, [shipmentId]);

  const addRouteToMap = (geojson) => {
    if (map.getSource("route")) {
      map.getSource("route").setData(geojson);
    } else {
      map.addLayer({
        id: "route",
        type: "line",
        source: {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: geojson,
            },
          },
        },
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3887be",
          "line-width": 5,
          "line-opacity": 0.75,
        },
      });
    }
  };

  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_API_TOKEN;
    map = new mapboxgl.Map({
      container: "map",
      style: MAPBOX_STYLESHEET_LOCATION,
      center: MAPBOX_START_CENTER, // starting position [lng, lat]
      zoom: MAPBOX_START_ZOOM, // starting zoom
    });
    // console.log(shipmentDetails);
    setSourceMarker(
      new Marker()
        .setLngLat(shipmentDetails.sourceLocation || [0, 0])
        .setPopup(new Popup({ offset: 25 }).setText(shipmentDetails.sourceName))
        .addTo(map)
    );
    setDestinationMarker(
      new Marker()
        .setLngLat(shipmentDetails.destinationLocation || [0, 0])
        .setPopup(
          new Popup({ offset: 25 }).setText(shipmentDetails.destinationName)
        )
        .addTo(map)
    );
    if (shipmentDetails.sourceLocation) {
      let renderRoute = async () => {
        let res = await axios.get(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${shipmentDetails.sourceLocation[0]},${shipmentDetails.sourceLocation[1]};${shipmentDetails.destinationLocation[0]},${shipmentDetails.destinationLocation[1]}?geometries=geojson&access_token=${MAPBOX_API_TOKEN}`
        );
        console.log(res.data);
        let route = res.data.routes[0].geometry.coordinates;
        let geojson = {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: route,
          },
        };

        // Problematic part
        // Route is not loaded the first time, page needs to be refreshed!
        map.on("style.load", () => {
          // console.log("On load");
          addRouteToMap(geojson);
        });

        map.on("styledata", () => {
          // console.log("Style");
          addRouteToMap(geojson);
        });
      };
      renderRoute();
    }
  }, [shipmentDetails]);

  useEffect(() => {
    if (shipmentDetails.status === "ongoing") {
      const socket = io(ENDPOINT);
      socket.on("connect", () => {
        // console.log("SocketIO client connected to server");
        socket.emit("map-client", { transferId: shipmentId });
      });
      socket.on("location-update", (msg) => {
        console.log(msg);
        if (msg) {
          setShipmentLocation(msg);
        }
      });
      return () => socket.disconnect();
    }
  }, [shipmentId, shipmentDetails]);

  useEffect(() => {
    if (shipmentDetails.status === "ongoing") {
      setShipmentMarker((prevMarker) => {
        if (prevMarker) prevMarker.remove();
        return new mapboxgl.Marker({ color: "#ff1744" })
          .setLngLat([shipmentLocation.longitude, shipmentLocation.latitude])
          .setPopup(shipmentPopup)
          .addTo(map);
      });
    }
  }, [shipmentLocation, shipmentDetails]);

  return (
    <div className="row" style={{ height: "90vh" }}>
      <div className="col s12 m2 l3 grey lighten-4" style={{ height: "100%" }}>
        <h5 className="text-muted">Details of Transfer</h5>
        <h5>
          {type === "incoming"
            ? `From: ${shipmentDetails.sourceName}`
            : `To: ${shipmentDetails.destinationName}`}
        </h5>
        <p>
          Address:{" "}
          {type === "incoming"
            ? shipmentDetails.sourceAddress
            : shipmentDetails.destinationAddress}
        </p>
        <p>
          Email:{" "}
          {type === "incoming"
            ? shipmentDetails.sourceEmail
            : shipmentDetails.destinationEmail}
        </p>
        {shipmentDetails.status === "completed" ? (
          <h4 className="center green-text">Completed</h4>
        ) : shipmentDetails.status === "ongoing" ? (
          <h4 className="red-text center">Ongoing</h4>
        ) : null}
        <p>Start: {shipmentDetails.startTime}</p>
        {shipmentDetails.status === "completed" && (
          <p>End: {shipmentDetails.endTime}</p>
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
