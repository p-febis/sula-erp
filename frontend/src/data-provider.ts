import { DataProvider } from "react-admin";

export const dataProvider: DataProvider = {
  getList: async (resource, _params) => {
    const response = await fetch(`/api/${resource}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    const json = await response.json();

    if (!response.ok) {
      throw json;
    }

    return {
      data: json.data,
      total: Array.isArray(json.data) ? json.data.length : 0,
    };
  },

  getOne: async (resource, params) => {
    const response = await fetch(`/api/${resource}/${params.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    const json = await response.json();

    if (!response.ok) {
      throw json;
    }

    return json;
  },

  create: async (resource, { data }) => {
    const response = await fetch(`/api/${resource}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    return json;
  },

  update: async (resource, { id, data }) => {
    const response = await fetch(`/api/${resource}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    return json;
  },
  updateMany: async () => Promise.reject("Not implemented"),
  delete: async (resource, { id }) => {
    const response = await fetch(`/api/${resource}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    const json = await response.json();

    if (!response.ok) {
      throw json;
    }

    return json;
  },
  deleteMany: async () => Promise.reject("Not implemented"),
  getMany: async () => Promise.reject("Not implemented"),
  getManyReference: async () => Promise.reject("Not implemented"),
};
