import {
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonPage,
  IonRouterOutlet,
  IonText,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { add, camera, logOut } from "ionicons/icons";
import React, { useContext } from "react";
import { Route, Redirect, useRouteMatch } from "react-router";
import { RoadList, RoadEdit } from "./components";
import GuardedRoute from "./components/GuardedRoute";
import Header from "./components/Header";
import { AuthContext } from "./providers/authProvider";
import { RoadProvider } from "./providers/roadProvider";
import Login from "./views/Login";

interface Props {}

const Setup = (props: Props) => {
  const { authToken, logout } = useContext(AuthContext);
  return (
    <IonReactRouter>
      <RoadProvider>
        <IonPage>
          <Header />
          <IonContent>
            <IonRouterOutlet>
              <GuardedRoute path="/roads" component={RoadList} exact />
              <GuardedRoute path="/road/:id" component={RoadEdit} exact />
              <GuardedRoute path="/road" component={RoadEdit} exact />
              <Route path="/login" component={Login} exact />
              <Redirect to="/roads" />
            </IonRouterOutlet>
            {authToken && (
              <IonFab vertical="bottom" horizontal="start" slot="fixed">
                <IonFabButton>
                  <IonIcon icon={logOut} onClick={logout} />
                </IonFabButton>
              </IonFab>
            )}
          </IonContent>
        </IonPage>
      </RoadProvider>
    </IonReactRouter>
  );
};

export default Setup;
