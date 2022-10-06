const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");
const { httpGetAllPlanets } = require("../routes/planets/planets.controller");
const planets = require("./planets.mongo");
const result = [];
const habitatPlanet = [];

const isHabitatPlanet = (planet) => {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
};
function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitatPlanet(data)) {
          habitatPlanet.push(data);
          await savePlanets(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        const countPlanetFound = (await getAllPlanets()).length;
        console.log(`${countPlanetFound} habitable planet found!`);
        console.log(habitatPlanet.length);
        resolve();
      });
  });
}

async function getAllPlanets() {
  // return habitatPlanet;
  return await planets.find({});
}

async function savePlanets(planet) {
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      {
        keplerName: planet.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.error(`could not save planet ${err}`);
  }
}
module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
