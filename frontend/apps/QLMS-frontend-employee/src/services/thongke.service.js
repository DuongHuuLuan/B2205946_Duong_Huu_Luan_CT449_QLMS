import createApiClient from "./api.service";

const baseURL = "/api/thongke";

class ThongKeService {
  constructor() {
    this.api = createApiClient(baseURL);
  }

  async getGeneralStats() {
    return (await this.api.get("/general")).data;
  }

  async getBooksByPublisher() {
    return (await this.api.get("/publisher-stats")).data;
  }

  async getStaffByRole() {
    return (await this.api.get("/staff-by-role")).data;
  }

  // Nếu bạn có triển khai Top Sách Mượn:
  async getTopBorrowedBooks() {
    return (await this.api.get("/top-borrowed")).data;
  }
}

export default new ThongKeService();
