"use client";
import { createContext, useContext, useEffect, useReducer } from "react";

import axios from "../helpers/axios";
import { User } from "../helpers/types";
import LoadingModal from "./LoadingModal";

interface State {
  authenticated: boolean;
  user: User | undefined;
  loading: boolean;
}

interface Action {
  type: string;
  payload: any;
}

const StateContext = createContext<State>({
  authenticated: false,
  user: undefined,
  loading: true,
});

const DispatchContext = createContext<((type: string, payload?: any) => void) | null>(null);

const reducer = (state: State, { type, payload }: Action) => {
  switch (type) {
    case "LOGIN":
      return {
        ...state,
        authenticated: true,
        user: payload,
        loading: false,
      };
    case "LOGOUT":
      return { ...state, authenticated: false, user: null, loading: false };
    case "LOADING":
      return { ...state, loading: true };
    case "STOP_LOADING":
      return { ...state, loading: false };
    default:
      throw new Error(`Unknown action type: ${type}`);
  }
};

// Component for the context
const ContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, defaultDispatch] = useReducer(reducer, {
    user: null,
    authenticated: false,
    loading: true,
  });

  // just to make it easier to call dispatch
  const dispatch = (type: string, payload?: any) => defaultDispatch({ type, payload });

  // fetch the user data when the page (re)loads
  // because we only know about the jwt in the first place
  useEffect(() => {
    // call back should not be async
    async function loadUser() {
      try {
        const res = await axios.get<User>("/auth/me");
        console.log("CONTEXT USER: ", res.data);
        dispatch("LOGIN", res.data);
      } catch (err) {
        dispatch("LOGOUT");
        console.log(err);
      }
    }
    loadUser();
  }, []);

  return (
    // All children have access to dispatch method and the state of the app (authenticated or not,...)
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
      <LoadingModal open={state.loading}></LoadingModal>
    </DispatchContext.Provider>
  );
};

// Export custom hooks for each state so that we can use those context variable in children.
// Not returning the context but return the function to get the context.
export const useAuthContext = () => useContext(StateContext);
export const useAppDispatch = () => useContext(DispatchContext);

export default ContextProvider;
