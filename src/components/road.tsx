import React from "react";
import { IonItem, IonLabel } from "@ionic/react";
import { RoadProps } from "./RoadProps";

interface RoadPropsExt extends RoadProps {
  onEdit: (id: number) => void;
  isLocalOnly: boolean;
}

const Road: React.FC<RoadPropsExt> = ({ id, name, onEdit, isLocalOnly }) => {
  return (
    <IonItem onClick={() => onEdit(id!)}>
      <IonLabel>
        {isLocalOnly && "Locally saved: "}
        {name}
      </IonLabel>
    </IonItem>
  );
};

export default Road;
