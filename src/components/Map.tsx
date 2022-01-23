import React from "react";
import { Marker } from "react-google-maps";
import GoogleMap from "react-google-maps/lib/components/GoogleMap";
import withGoogleMap from "react-google-maps/lib/withGoogleMap";
import withScriptjs from "react-google-maps/lib/withScriptjs";

type MapProps = {
  onClick: (e: any) => void;
  lat?: number;
  long?: number;
};

const MapComponent = ({ onClick, lat, long }: MapProps) => (
  <GoogleMap
    defaultZoom={8}
    defaultCenter={{ lat: -34.397, lng: 150.644 }}
    onClick={onClick}
  >
    {lat && long && <Marker position={{ lat, lng: long }} />}
  </GoogleMap>
);

export default withScriptjs(withGoogleMap(MapComponent));
