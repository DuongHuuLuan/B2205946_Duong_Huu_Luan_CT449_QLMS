import createApiClient from "./api.service";

class SachService {
  constructor(baseURL = "/api/sach") {
    this.api = createApiClient(baseURL);
  }

  async getAll() {
    return (await this.api.get("/")).data;
  }

  async get(id) {
    return (await this.api.get(`/${id}`)).data;
  }

  async createWithCover(sachObj, file = null) {
    const fd = new FormData();
    Object.entries(sachObj).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, v);
    });
    if (file) fd.append("BiaSach", file);

    return (await this.api.post("/", fd)).data;
  }

  async updateWithCover(id, sachObj, file = null) {
    const fd = new FormData();
    Object.entries(sachObj).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, v);
    });
    if (file) fd.append("BiaSach", file);

    return (await this.api.put(`/${id}`, fd)).data;
  }

  async delete(id) {
    return (await this.api.delete(`/${id}`)).data;
  }
}

export default new SachService();
