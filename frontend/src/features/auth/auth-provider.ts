import { AuthProvider } from "react-admin";

async function tryRefresh(): Promise<boolean> {
  const response = await fetch("/api/auth/refresh", {
    credentials: "same-origin",
    method: "POST",
  });

  if(!response.ok) return false;

  const json = await response.json();
  const accessToken = json["data"];

  localStorage.setItem("accessToken", accessToken);


  return true;
};

export const authProvider: AuthProvider = {
  login: async (parameters) => {
    const { data, ...response } = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(parameters),
    }).then((res) => res.json());

    if (response.status !== 200) {
      throw "Invalid login details!";
    }

    localStorage.setItem("accessToken", data.accessToken);
  },
  logout: async () => {
    localStorage.removeItem("accessToken");
  },
  checkError: async ({ status }) => {
    if(status === 401) {

      const success = await tryRefresh();
      if(success) return Promise.resolve();

      return Promise.reject();
    }

    return Promise.resolve();
  },
  checkAuth: async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw "No user!";
    }
  },
};
