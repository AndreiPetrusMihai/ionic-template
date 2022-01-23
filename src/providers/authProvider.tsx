import React, { useEffect } from "react";
import { useState } from "react";
import axiosClient from "../utils/axiosClient";
import { Plugins } from "@capacitor/core";
import { AxiosResponse } from "axios";
import { notifications } from "ionicons/icons";
const { Storage } = Plugins;
type AuthProviderProps = {};

type AuthState = {
  authToken: string | null;
  login?: (email: string, password: string) => void;
  logout?: () => void;
  retrieveingToken: boolean;
};

const initialState: AuthState = {
  authToken: null,
  retrieveingToken: true,
};

export const AuthContext = React.createContext<AuthState>(initialState);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [retrieveingToken, setRetrieveingToken] = useState(true);

  const setLSToken = async (token: string) => {
    await Storage.set({
      key: "authToken",
      value: token,
    });
  };

  const removeLSToken = async () => {
    Storage.remove({ key: "authToken" });
  };

  const getLSToken = async () => {
    return await Storage.get({
      key: "authToken",
    });
  };

  useEffect(() => {
    setRetrieveingToken(true);
    getLSToken().then((token) => {
      if (token.value) {
        axiosClient.interceptors.request.use((config) => {
          config.headers.Authorization = `Bearer ${token.value}`;
          return config;
        });
      }
      setAuthToken(token.value);
      setRetrieveingToken(false);
    });
  }, []);

  const login = (email: string, password: string) => {
    setRetrieveingToken(true);
    axiosClient
      .post("login", { email, password })
      .then((res: AxiosResponse<string>) => {
        setLSToken(res.data);
        setAuthToken(res.data);
        axiosClient.interceptors.request.use((config) => {
          config.headers.Authorization = `Bearer ${res.data}`;
          return config;
        });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setRetrieveingToken(false);
      });
  };

  const logout = () => {
    removeLSToken();
    setAuthToken(null);
  };

  const value = {
    authToken,
    login,
    logout,
    retrieveingToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
