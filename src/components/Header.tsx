import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonGrid,
  IonRow,
  IonCol,
  CreateAnimation,
} from "@ionic/react";
import React, { useContext, useEffect } from "react";
import { useRouteMatch } from "react-router";
import { NetworkContext } from "../providers/networkProvider";

interface Props {}

const Header = (props: Props) => {
  const { networkStatus } = useContext(NetworkContext);
  const match = useRouteMatch(["/road/:id", "/road", "/roads", "/login"]);

  const headerTextRef = React.createRef();
  useEffect(() => {}, []);

  const getHeaderTitle = () => {
    switch (match?.path || "") {
      case "/roads":
        return "Roads Manager";
      case "/login":
        return "Welcome to Road Manager!";
      case "/road":
      case "/road/:id":
        return "Edit";
      default:
        return "You seem lost";
    }
  };

  return (
    <IonHeader>
      <IonToolbar>
        <IonTitle>
          <IonGrid>
            <IonRow>
              <IonCol>{getHeaderTitle()}</IonCol>
              <IonCol className="ion-text-end">
                <CreateAnimation
                  duration={5000}
                  iterations={Infinity}
                  play={true}
                  keyframes={[
                    { offset: 0, transform: "scale(1)", opacity: "0.5" },
                    { offset: 0.5, transform: "scale(0.8)", opacity: "1" },
                    { offset: 1, transform: "scale(1)", opacity: "0.5" },
                  ]}
                >
                  <div>
                    {networkStatus.connected ? "Connected" : "Disconnected"}
                  </div>
                </CreateAnimation>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonTitle>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
