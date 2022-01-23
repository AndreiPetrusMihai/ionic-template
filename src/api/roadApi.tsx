import axiosClient from "../utils/axiosClient";
import { getLogger } from "../core";
import { RoadProps } from "../components/RoadProps";

const log = getLogger("roadApi");

const baseUrl = "localhost:4000";
const roadUrl = `http://${baseUrl}/road`;

interface ResponseProps<T> {
  data: T;
}

function withLogs<T>(
  promise: Promise<ResponseProps<T>>,
  fnName: string
): Promise<T> {
  return promise
    .then((res) => {
      return Promise.resolve(res.data);
    })
    .catch((err) => {
      return Promise.reject(err);
    });
}

const config = {
  headers: {
    "Content-Type": "application/json",
  },
};

type GetRoadsReturnType = {
  page: number;
  roads: RoadProps[];
  more: boolean;
};

export const getRoads: (
  page: number,
  sName: string,
  onlyOperational: boolean
) => Promise<GetRoadsReturnType> = (
  page: number = 1,
  sName: string = "",
  onlyOperational: boolean = false
) => {
  return withLogs(
    axiosClient
      .get(
        `/roads?page=${page}&sName=${sName}&onlyOperational=${onlyOperational}`,
        config
      )
      .then((data) => {
        data.data.roads.forEach((road: any) => {
          road.id = parseInt(road.id);
        });
        return data;
      }),
    "getRoads"
  );
};

export const createRoad: (road: RoadProps) => Promise<RoadProps> = (road) => {
  return withLogs(
    axiosClient.post(roadUrl, road, config).then((data) => {
      data.data.id = parseInt(data.data.id);
      return data;
    }),
    "createRoad"
  );
};

export const updateRoad: (road: RoadProps) => Promise<RoadProps> = (road) => {
  return withLogs(
    axiosClient.put(`${roadUrl}/${road.id}`, road, config).then((data) => {
      data.data.id = parseInt(data.data.id);
      return data;
    }),
    "updateRoad"
  );
};

export const uploadLocalRoads: (
  localRoads: RoadProps[]
) => Promise<RoadProps[]> = (localRoads) => {
  return withLogs(
    axiosClient.post(`/roads/sync`, localRoads, config).then((data) => {
      data.data.forEach((road: any) => {
        road.id = parseInt(road.id);
      });
      return data;
    }),
    "syncRoads"
  );
};

interface MessageData {
  event: string;
  payload: {
    road: RoadProps;
  };
}

export const newWebSocket = (
  onMessage: (data: MessageData) => void,
  authToken: string
) => {
  const ws = new WebSocket(`ws://${baseUrl}`);
  ws.onopen = () => {
    log("web socket onopen");
    ws.send(JSON.stringify({ type: "authenticate", payload: authToken }));
  };
  ws.onclose = () => {
    log("web socket onclose");
  };
  ws.onerror = (error) => {
    log("web socket onerror", error);
  };
  ws.onmessage = (messageEvent) => {
    log("web socket onmessage");
    onMessage(JSON.parse(messageEvent.data));
  };
  return ws;
};
