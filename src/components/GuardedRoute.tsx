import React, { ReactChild, ReactFragment, useContext, useEffect } from "react";
import { Route, RouteComponentProps, useHistory } from "react-router";
import { AuthContext } from "../providers/authProvider";

interface Props {
  component:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>;
  exact: boolean;
  path: string;
}

const GuardedRoute = ({ component, exact, path }: Props) => {
  const { authToken } = useContext(AuthContext);
  const history = useHistory();
  useEffect(() => {
    if (!authToken) history.push("/login");
  }, [authToken]);

  return <Route path={path} component={component} exact={exact} /> || null;
};

export default GuardedRoute;
