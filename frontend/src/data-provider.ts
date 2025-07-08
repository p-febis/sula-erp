import { DataProvider } from "react-admin";

export const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    const response = await fetch(`/api/${resource}`);
    const json = await response.json();

    return {
      ...json,
      total: Array.isArray(json.data) ? json.data.length : null,
    };
  },
};
