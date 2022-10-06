const request = require("supertest");
const app = require("../../app");
const { mongoConnection, mongoDisconnect } = require("../../services/mongo");

describe("Launches API", () => {
  beforeAll(async () => {
    await mongoConnection();
  });
  afterAll(async () => {
    await mongoDisconnect();
  });
  describe("Test GET /launches", () => {
    test("It should respond with 200 success", async () => {
      const response = await request(app).get("/v1/launches").expect(200);
    });
  });

  describe("Test Post /launches", () => {
    const completeLaunchData = {
      mission: "uss enterprise",
      rocket: "NCC",
      target: "Kepler-186 f",
      launchDate: "january 4,2023",
    };
    const LaunchDataWithOutDate = {
      mission: "uss enterprise",
      rocket: "NCC",
      target: "Kepler-186 f",
    };
    const launchDataWithInvalidDate = {
      mission: "uss enterprise",
      rocket: "NCC",
      target: "Kepler-186 f",
      launchDate: "zoo",
    };
    test("it should response with 201 success", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);
      expect(response.body).toMatchObject(LaunchDataWithOutDate);
    });
    test("It should catch missing property", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(LaunchDataWithOutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "mising required property",
      });
    });
    test("It should catch invalid date", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "invalid Date",
      });
    });
  });
});
