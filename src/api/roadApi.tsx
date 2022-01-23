import axiosClient from "../utils/axiosClient";
import { RoadProps } from "../components/RoadProps";
import { AxiosResponse } from "axios";

const baseUrl = "localhost:4000";

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
) => Promise<GetRoadsReturnType> = async (
  page: number = 1,
  sName: string = "",
  onlyOperational: boolean = false
) => {
  return axiosClient
    .get(
      `/roads?page=${page}&sName=${sName}&onlyOperational=${onlyOperational}`,
      config
    )
    .then((res: AxiosResponse<GetRoadsReturnType>) => {
      res.data.roads.forEach((road: any) => {
        road.id = parseInt(road.id);
      });
      return res.data;
    });
};

export const createRoad: (road: RoadProps) => Promise<RoadProps> = (road) => {
  return axiosClient.post<RoadProps>("/road", road, config).then((res) => {
    res.data.id = parseInt(res.data.id as any as string);
    return res.data;
  });
};

export const updateRoad: (road: RoadProps) => Promise<RoadProps> = (road) => {
  return axiosClient
    .put<RoadProps>(`/road/${road.id}`, road, config)
    .then((res) => {
      res.data.id = parseInt(res.data.id as any as string);
      return res.data;
    });
};

export const uploadLocalRoads: (
  localRoads: RoadProps[]
) => Promise<RoadProps[]> = (localRoads) => {
  return axiosClient
    .post<RoadProps[]>(`/roads/sync`, localRoads, config)
    .then((res) => {
      res.data.forEach((road: any) => {
        road.id = parseInt(road.id as any as string);
      });
      return res.data;
    });
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
    ws.send(JSON.stringify({ type: "authenticate", payload: authToken }));
  };
  ws.onclose = () => {};
  ws.onerror = (error) => {
    console.log(error);
  };
  ws.onmessage = (messageEvent) => {
    onMessage(JSON.parse(messageEvent.data));
  };
  return ws;
};
