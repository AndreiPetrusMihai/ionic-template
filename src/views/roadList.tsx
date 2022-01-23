import React, { useContext, useEffect, useRef, useState } from "react";
import { RouteComponentProps } from "react-router";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCheckbox,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonPage,
  IonRow,
  IonText,
  IonTitle,
} from "@ionic/react";
import { add } from "ionicons/icons";
import Road from "../components/road";
import { getLogger } from "../core";
import { RoadContext } from "../providers/roadProvider";
import { NetworkContext } from "../providers/networkProvider";

const log = getLogger("RoadList");

const RoadList: React.FC<RouteComponentProps> = ({ history }) => {
  const {
    roads,
    localSavedRoads,
    fetching,
    fetchingError,
    onlyOperational,
    sName,
    page,
    setPage,
    setOnlyOperational,
    setSName,
    more,
  } = useContext(RoadContext);
  const evRef = useRef<any>(null);

  const [searchName, setSearchName] = useState("");
  const { networkStatus } = useContext(NetworkContext);
  useEffect(() => {
    if (evRef.current && !fetching) {
      evRef.current.complete();
      evRef.current = null;
    }
  }, [fetching]);

  const loadMoreData = (ev: any) => {
    evRef.current = ev.target;
    if (more) {
      setPage && setPage(page + 1);
    }
  };

  return (
    <IonContent>
      {networkStatus.connected && (
        <IonCard>
          <IonCardContent>
            <IonRow
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
              }}
            >
              <IonCol>
                <IonItem>
                  <IonLabel position="stacked">Name</IonLabel>
                  <IonInput
                    value={searchName}
                    onIonChange={(e) => {
                      setSearchName(e.detail.value!);
                    }}
                  ></IonInput>
                </IonItem>
              </IonCol>
              <IonCol>
                <IonButton onClick={() => setSName && setSName(searchName)}>
                  <IonIcon
                    icon="search-outline"
                    className="align-self-center"
                  ></IonIcon>
                </IonButton>
              </IonCol>
            </IonRow>
            <IonItem>
              <IonCheckbox
                checked={onlyOperational}
                onIonChange={(e) =>
                  setOnlyOperational && setOnlyOperational(e.detail.checked)
                }
                slot="start"
              />
              <IonLabel>Only Operational</IonLabel>
            </IonItem>
          </IonCardContent>
        </IonCard>
      )}

      <IonCard>
        <IonLoading isOpen={fetching} message="Fetching roads" />
        {roads && (
          <IonList>
            {localSavedRoads &&
              localSavedRoads.map(({ id, name }, index) => (
                <Road
                  isLocalOnly
                  key={index}
                  name={name}
                  id={id}
                  onEdit={(id: number) => history.push(`/road/${id}`)}
                />
              ))}
            {roads.map(({ id, name }) => (
              <Road
                isLocalOnly={false}
                key={id}
                id={id}
                name={name}
                onEdit={(id: number) => history.push(`/road/${id}`)}
              />
            ))}
          </IonList>
        )}
        {fetchingError && (
          <div>{fetchingError.message || "Failed to fetch roads"}</div>
        )}
        {networkStatus.connected && more && (
          <IonInfiniteScroll onIonInfinite={loadMoreData} threshold="100px">
            <IonInfiniteScrollContent
              loadingSpinner="bubbles"
              loadingText="Loading more data..."
            ></IonInfiniteScrollContent>
          </IonInfiniteScroll>
        )}
      </IonCard>
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton onClick={() => history.push("/road")}>
          <IonIcon icon={add} />
        </IonFabButton>
      </IonFab>
    </IonContent>
  );
};

export default RoadList;
