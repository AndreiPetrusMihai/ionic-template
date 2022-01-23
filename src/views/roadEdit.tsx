import React, { useContext, useEffect, useState } from "react";
import {
  CreateAnimation,
  createAnimation,
  IonButton,
  IonButtons,
  IonCard,
  IonCheckbox,
  IonContent,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonLoading,
  IonRow,
  IonText,
} from "@ionic/react";
import { RoadContext } from "../providers/EntitiesProvider";
import { RouteComponentProps, useHistory } from "react-router";
import { RoadProps } from "../components/RoadProps";
import { usePhotoGallery } from "../utils/usePhotoGallery";

import MapComponent from "../components/Map";

interface RoadEditProps
  extends RouteComponentProps<{
    id?: string;
  }> {}

const RoadEdit: React.FC<RoadEditProps> = ({ match }) => {
  const { roads, localSavedRoads, saving, savingError, saveRoad } =
    useContext(RoadContext);
  const history = useHistory();
  const [name, setName] = useState("");
  const [lanes, setLanes] = useState(0);
  const [lastMaintained, setLastMaintained] = useState<Date | null>(null);
  const [isOperational, setIsOperational] = useState(false);
  const [base64Photo, setBase64Photo] = useState<string | null>(null);
  const { takePhoto, uploadPhoto, savePicture } = usePhotoGallery();
  const [lat, setLat] = useState<number | undefined>();
  const [long, setLong] = useState<number | undefined>();

  const [road, setRoad] = useState<RoadProps>();
  const routeId = match.params.id || "";
  const correspondingRoad = [
    ...(roads || []),
    ...(localSavedRoads || []),
  ]?.find((it) => Number(it.id) == parseInt(routeId));

  useEffect(() => {
    setRoad(correspondingRoad);
    if (correspondingRoad) {
      setName(correspondingRoad.name);
      setLanes(correspondingRoad.lanes || 0);
      setBase64Photo(correspondingRoad.base64Photo || null);
      setLastMaintained(
        new Date(correspondingRoad.lastMaintained as any as string) || null
      );
      setIsOperational(correspondingRoad.isOperational || false);
      setLat(correspondingRoad.lat);
      setLong(correspondingRoad.long);
    }
  }, [correspondingRoad?.id, correspondingRoad?.version]);

  const savePictureToDevice = () => {
    console.log({ base64Data: base64Photo, routeId });
    savePicture(base64Photo!, routeId || "");
  };

  const takePhotoForItem = () => {
    takePhoto().then((photo) => {
      if (photo.base64String) setBase64Photo(photo.base64String);
    });
  };

  const uploadPhotoForItem = () => {
    uploadPhoto().then((photo) => {
      if (photo.base64String) setBase64Photo(photo.base64String);
    });
  };

  const handleSave = () => {
    const editedRoad = road
      ? {
          ...road,
          name,
          lanes,
          isOperational,
          base64Photo: base64Photo || undefined,
          lat,
          long,
        }
      : {
          name,
          lanes,
          isOperational,
          base64Photo: base64Photo || undefined,
          lat,
          long,
        };
    saveRoad && saveRoad(editedRoad).then(() => history.push("/roads"));
  };

  const onMapClick = (ev: any) => {
    setLat(ev.latLng.lat());
    setLong(ev.latLng.lng());
    console.log("latitide = ", ev.latLng.lat());
    console.log("longitude = ", ev.latLng.lng());
  };

  const exitAnimation = (baseEl: any) => {
    const fadeAnimation = createAnimation()
      .addElement(baseEl)
      .keyframes([
        { offset: 0, opacity: "0.99" },
        { offset: 1, opacity: "0.00" },
      ]);

    return createAnimation()
      .addElement(baseEl)
      .duration(600)
      .addAnimation([fadeAnimation]);
  };

  return (
    <IonContent>
      <IonCard>
        <IonItem>
          <IonLabel position="floating">Road Name</IonLabel>
          <IonInput
            value={name}
            onIonChange={(e) => setName(e.detail.value || "")}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Lanes</IonLabel>
          <IonInput
            value={lanes}
            onIonChange={(e) => setLanes(parseInt(e.detail.value || "0"))}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Last Maintained</IonLabel>
          <IonInput
            readonly
            value={lastMaintained?.toDateString() || "No info"}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Is Operational</IonLabel>
          <IonCheckbox
            checked={isOperational}
            onIonChange={(e) => setIsOperational(e.detail.checked)}
          />
        </IonItem>
        <IonRow>
          <CreateAnimation
            duration={5000}
            play={true}
            iterations={Infinity}
            keyframes={[
              { offset: 0, transform: "scale(1)", opacity: "0.5" },
              { offset: 0.5, transform: "scale(0.8)", opacity: "1" },
              { offset: 1, transform: "scale(1)", opacity: "0.5" },
            ]}
          >
            <IonButtons>
              <IonButton onClick={handleSave}>Save</IonButton>
            </IonButtons>
          </CreateAnimation>

          <IonButtons>
            <IonButton onClick={() => history.push("/roads")}>Back</IonButton>
          </IonButtons>
        </IonRow>

        <IonRow>
          <IonButtons>
            <IonButton onClick={takePhotoForItem}>Take Photo</IonButton>
          </IonButtons>
          <IonButtons>
            <IonButton onClick={uploadPhotoForItem}>Upload Photo</IonButton>
          </IonButtons>
          {base64Photo && (
            <IonButtons>
              <IonButton onClick={savePictureToDevice}>Save Photo</IonButton>
            </IonButtons>
          )}
          {base64Photo && (
            <IonButtons>
              <IonButton onClick={() => setBase64Photo(null)}>
                Clear Photo
              </IonButton>
            </IonButtons>
          )}
        </IonRow>

        {base64Photo && (
          <IonImg src={"data:image/jpeg;base64," + base64Photo} />
        )}

        <IonLoading isOpen={saving} leaveAnimation={exitAnimation} />
        {savingError && (
          <div>{savingError.message || "Failed to save road"}</div>
        )}
      </IonCard>
      <IonCard>
        <IonRow>
          <IonText>Lat: {lat?.toFixed(2) || "-"}</IonText>
        </IonRow>
        <IonRow>
          <IonText>Long: {long?.toFixed(2) || "-"}</IonText>
        </IonRow>
        {lat && long && (
          <IonRow>
            <IonButton
              onClick={() => {
                setLong(undefined);
                setLat(undefined);
              }}
            >
              Clear Pin
            </IonButton>
          </IonRow>
        )}
        <MapComponent
          lat={lat}
          long={long}
          onClick={onMapClick}
          googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div style={{ height: `400px` }} />}
          mapElement={<div style={{ height: `100%` }} />}
        />
      </IonCard>
    </IonContent>
  );
};

export default RoadEdit;
