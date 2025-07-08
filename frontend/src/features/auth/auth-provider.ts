import { AuthProvider } from "react-admin";

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
  checkError: async (error) => {},
  checkAuth: async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw "No user!";
    }
  },
};
