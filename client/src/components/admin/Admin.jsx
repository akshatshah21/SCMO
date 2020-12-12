import React, {useEffect} from 'react'
import axios from "axios";
import M from "materialize-css";
import mapboxgl from "mapbox-gl";

import { MAPBOX_API_TOKEN } from "../../config/keys";
import {
  MAPBOX_STYLESHEET_LOCATION,
  MAPBOX_START_ZOOM,
  MAPBOX_START_CENTER,
  API_URL,
} from "../../config/options";

var map;

export default function Admin() {

  useEffect(() => {
    const getStages = async () => {
      try {
        let {data: stages} = await axios.get(API_URL + "/api/stage/allStageLocations");
        console.log(stages);
        mapboxgl.accessToken = MAPBOX_API_TOKEN;
        map = new mapboxgl.Map({
          container: "map",
          style: MAPBOX_STYLESHEET_LOCATION,
          center: MAPBOX_START_CENTER, // starting position [lng, lat]
          zoom: MAPBOX_START_ZOOM, // starting zoom
        });
        map.on("styledata", () => {
          console.log("Style");
          if(map.getSource('stages')) {
            map.getSource('stages').setData(stages);
          } else {
            map.addSource('stages', {
              type: 'geojson',
              data: stages
            });
            map.addLayer({
              'id': 'points',
              'source': 'stages',
              'type': 'circle',
              'paint': {
                'circle-radius': 5,
                'circle-color': '#223b53',
                'circle-stroke-color': 'white',
                'circle-stroke-width': 1,
                'circle-opacity': 0.5
              }
            });
          }
        })
        
      } catch (error) {
        M.toast({html: "Error"});
        console.log(error);
      }
    }
    getStages();
   
  }, [])

  return (
    <>
      <h2 className="center">Admin</h2>
      <div id="map" className="col s12 m10 l9" style={{ height: "70vh" }}></div> 
    </>
  )
}
