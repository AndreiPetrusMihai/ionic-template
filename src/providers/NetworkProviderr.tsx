import { Network, NetworkStatus } from "@capacitor/core";
import React, { createContext, FC, useEffect, useState } from "react";

type NetworkProviderProps = {};

type NetworkState = {
  networkStatus: NetworkStatus;
};

const initialState: NetworkState = {
  networkStatus: { connected: false, connectionType: "none" },
};

export const NetworkContext = createContext<NetworkState>(initialState);

const NetworkProvider: FC<NetworkProviderProps> = ({ children }) => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    connected: false,
    connectionType: "none",
  });

  useEffect(() => {
    Network.getStatus().then((status) => setNetworkStatus(status));
    const netListener = Network.addListener("networkStatusChange", (status) => {
      setNetworkStatus(status);
    });

    return () => {
      netListener.remove();
    };
  }, []);

  const value = { networkStatus };

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
};
export default NetworkProvider;
