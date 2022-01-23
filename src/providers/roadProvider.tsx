import React, {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import PropTypes from "prop-types";
import { getLogger } from "../core";
import { RoadProps } from "../components/RoadProps";
import {
  createRoad,
  getRoads,
  newWebSocket,
  updateRoad,
  uploadLocalRoads,
} from "../api/roadApi";
import { AuthContext } from "./authProvider";
import { NetworkContext } from "./networkProvider";

const log = getLogger("RoadProvider");

type SaveRoadFn = (road: RoadProps) => Promise<any>;

export interface RoadsState {
  roads?: RoadProps[];
  localSavedRoads?: RoadProps[];
  fetching: boolean;
  fetchingError?: Error | null;
  saving: boolean;
  savingError?: Error | null;
  page: number;
  more: boolean;
  sName: string;
  onlyOperational: boolean;
  saveRoad?: SaveRoadFn;
  setOnlyOperational?: Function;
  setSName?: Function;
  setPage?: Function;
}

interface ActionProps {
  type: string;
  payload?: any;
}

const initialState: RoadsState = {
  fetching: false,
  saving: false,
  page: 1,
  more: true,
  sName: "",
  onlyOperational: false,
};

const FETCH_ROADS_STARTED = "FETCH_ROADS_STARTED";
const FETCH_ROADS_SUCCEEDED = "FETCH_ROADS_SUCCEEDED";
const SYNC_ROADS_SUCCEEDED = "SYNC_ROADS_SUCCEEDED";
const FETCH_ROADS_FAILED = "FETCH_ROADS_FAILED";
const SAVE_ROAD_STARTED = "SAVE_ROAD_STARTED";
const SAVE_ROAD_LOCALLY = "SAVE_ROAD_LOCALLY";
const SAVE_ROAD_SUCCEEDED = "SAVE_ROAD_SUCCEEDED";
const SAVE_ROAD_FAILED = "SAVE_ROAD_FAILED";
const CLEAR_ROADS = "CLEAR_ROADS";
const SET_PAGE = "SET_PAGE";
const SET_S_NAME = "SET_S_NAME";
const SET_ONLY_OPERATIONAL = "SET_ONLY_OPERATIONAL";

const roadComplies = (
  road: RoadProps,
  sName: string,
  onlyOperational: boolean
) => {
  return (
    (onlyOperational === false || road.isOperational === true) &&
    road.name.includes(sName)
  );
};

const reducer: (state: RoadsState, action: ActionProps) => RoadsState = (
  state,
  { type, payload }
) => {
  console.log(type);
  switch (type) {
    case FETCH_ROADS_STARTED:
      return { ...state, fetching: true, fetchingError: null };

    case FETCH_ROADS_SUCCEEDED:
      const nonDuplicatedRoads = payload.roads.filter(
        (nRoad: RoadProps) =>
          !(state.roads?.some((sRoad) => sRoad.id === nRoad.id) || false)
      );
      return {
        ...state,
        roads: [...(state.roads || []), ...nonDuplicatedRoads],
        localSavedRoads: [],
        fetching: false,
        more: payload.more,
      };

    case SYNC_ROADS_SUCCEEDED:
      return {
        ...state,
        roads: payload.roads,
        localSavedRoads: [],
        fetching: false,
        more: true,
        page: 1,
        sName: "",
        onlyOperational: false,
      };
    case FETCH_ROADS_FAILED:
      return { ...state, fetchingError: payload.error, fetching: false };
    case SAVE_ROAD_STARTED:
      return { ...state, savingError: null, saving: true };
    case SAVE_ROAD_SUCCEEDED:
      let roads = [...(state.roads || [])];
      const { road } = payload;
      const index = roads.findIndex((it) => it.id == road.id);
      if (roadComplies(road, state.sName, state.onlyOperational)) {
        if (index === -1) {
          roads = [road, ...roads];
        } else {
          roads[index] = road;
        }
      } else {
        if (index !== -1) roads = roads.filter((fRoad) => fRoad.id === road.id);
      }
      return { ...state, roads, saving: false };
    case SAVE_ROAD_LOCALLY:
      const { road: localRoad } = payload;
      let biggestId = -1;
      [...(state.roads || []), ...(state.localSavedRoads || [])].forEach(
        (road) => {
          if (road.id! > biggestId) biggestId = road.id!;
        }
      );
      console.log(biggestId);

      localRoad.id = biggestId;
      localRoad.createdOnFrontend = true;
      return {
        ...state,
        saving: false,
        roads: state.roads?.filter((road) => road.id !== localRoad.id),
        localSavedRoads: [localRoad, ...(state.localSavedRoads || [])],
      };
    case SAVE_ROAD_FAILED:
      return { ...state, savingError: payload.error, saving: false };
    case CLEAR_ROADS:
      return { ...initialState };
    case SET_PAGE:
      return { ...state, page: payload };
    case SET_S_NAME:
      return { ...state, sName: payload, page: 1, roads: [] };
    case SET_ONLY_OPERATIONAL:
      return { ...state, onlyOperational: payload, page: 1, roads: [] };
    default:
      return state;
  }
};

export const RoadContext = React.createContext<RoadsState>(initialState);

interface RoadProviderProps {
  children: PropTypes.ReactNodeLike;
}

export const RoadProvider: React.FC<RoadProviderProps> = ({ children }) => {
  const { authToken } = useContext(AuthContext);

  const { networkStatus } = useContext(NetworkContext);

  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    page,
    more,
    onlyOperational,
    sName,
    roads,
    localSavedRoads,
    fetching,
    fetchingError,
    saving,
    savingError,
  } = state;

  const setOnlyOperational = (onlyOperational: boolean) => {
    dispatch({ type: SET_ONLY_OPERATIONAL, payload: onlyOperational });
  };

  const setSName = (sName: string) => {
    dispatch({ type: SET_S_NAME, payload: sName });
  };

  const setPage = (setPage: number) => {
    dispatch({ type: SET_PAGE, payload: setPage });
  };

  useEffect(getRoadsEffect, [authToken, page, sName, onlyOperational]);
  useEffect(wsEffect, [authToken, networkStatus]);

  useEffect(() => {
    if (
      networkStatus.connected &&
      localSavedRoads &&
      localSavedRoads.length > 0
    ) {
      dispatch({ type: FETCH_ROADS_STARTED });
      uploadLocalRoads(localSavedRoads)
        .then((roads) => {
          dispatch({ type: SYNC_ROADS_SUCCEEDED, payload: { roads, more } });
        })
        .catch((error) => {
          dispatch({ type: FETCH_ROADS_FAILED, payload: { error } });
        });
    }
  }, [networkStatus.connected]);

  const saveRoad = useCallback<SaveRoadFn>(saveRoadCallback, []);
  const value = {
    page,
    more,
    sName,
    onlyOperational,
    roads,
    localSavedRoads,
    fetching,
    fetchingError,
    saving,
    savingError,
    saveRoad: saveRoad,
    setOnlyOperational,
    setSName,
    setPage,
  };

  return <RoadContext.Provider value={value}>{children}</RoadContext.Provider>;

  function getRoadsEffect() {
    let canceled = false;

    if (authToken) {
      if (networkStatus.connected === true) {
        fetchRoads();
      }
    } else {
      dispatch({ type: CLEAR_ROADS });
    }
    return () => {
      canceled = true;
    };

    async function fetchRoads() {
      try {
        dispatch({ type: FETCH_ROADS_STARTED });
        const {
          roads,
          page: retrievedPage,
          more,
        } = await getRoads(page, sName, onlyOperational);
        if (!canceled) {
          dispatch({
            type: FETCH_ROADS_SUCCEEDED,
            payload: { roads, more, page: retrievedPage },
          });
        }
      } catch (error) {
        dispatch({ type: FETCH_ROADS_FAILED, payload: { error } });
      }
    }
  }

  async function saveRoadCallback(road: RoadProps) {
    try {
      dispatch({ type: SAVE_ROAD_STARTED });
      const savedRoad = await (road.id ? updateRoad(road) : createRoad(road));
      dispatch({ type: SAVE_ROAD_SUCCEEDED, payload: { road: savedRoad } });
    } catch (error) {
      dispatch({ type: SAVE_ROAD_LOCALLY, payload: { road } });
    }
  }

  function wsEffect() {
    if (authToken && networkStatus.connected) {
      let canceled = false;
      const ws = newWebSocket((message) => {
        if (canceled) {
          return;
        }
        const {
          event,
          payload: { road },
        } = message;
        if (event === "created" || event === "updated") {
          dispatch({ type: SAVE_ROAD_SUCCEEDED, payload: { road } });
        }
      }, authToken);
      return () => {
        console.log("Closign");
        canceled = true;
        ws.close();
      };
    }
    return () => {
      console.log("Clearing");
    };
  }
};
