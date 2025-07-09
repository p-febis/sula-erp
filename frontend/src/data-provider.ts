import { DataProvider } from "react-admin";

export const dataProvider: DataProvider = {
  getList: async (resource, _params) => {
    const response = await fetch(`/api/${resource}`);
    const json = await response.json();

    return {
      data: json.data,
      total: Array.isArray(json.data) ? json.data.length : 0,
    };
  },

  getOne: async (resource, params) => {
    const response = await fetch(`/api/${resource}/${params.id}`);
    const json = await response.json();

    return json;
  },

  create: async (resource, { data }) => {
    const response = await fetch(`/api/${resource}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    return json;
  },

  update: async () => Promise.reject("Not implemented"),
  updateMany: async () => Promise.reject("Not implemented"),
  delete: async () => Promise.reject("Not implemented"),
  deleteMany: async () => Promise.reject("Not implemented"),
  getMany: async () => Promise.reject("Not implemented"),
  getManyReference: async () => Promise.reject("Not implemented"),
};
