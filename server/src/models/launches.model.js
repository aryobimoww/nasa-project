const axios = require("axios");
const launches = require("./launches.mongo");
const planets = require("./planets.mongo");
// const launches = new Map();
const DEFAULT_FLIGHT_NUMBER = 100;
let latestFlightNumber = 100;
// const launch = {
//   flightNumber: 100, //flight_number
//   mission: "kepler exploration x", //name
//   rocket: "explore IS1", //rocket.name
//   launchDate: new Date("December 27, 2030"), //date_local
//   target: "Kepler-442 b",
//   customers: ["ZTM", "NASA"],
//   upcoming: true, //upcoming
//   success: true, //success
// };
// saveLaunches(launch);

async function findLaunch(filter) {
  return launches.findOne(filter);
}

async function existLaunchId(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  });
}
async function getLatestFlightNumber() {
  const latestLaunch = await launches.findOne().sort("-flightNumber");

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}
async function getAllLaunches(skip, limit) {
  return await launches
    .find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}
async function saveLaunches(launch) {
  await launches.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}
async function scheduleNewLaunch(launch) {
  const planet = planets.findOne({
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error("no matching planet");
  }
  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["ZTM", "NASA"],
    flightNumber: newFlightNumber,
  });
  await saveLaunches(newLaunch);
}

// function addNewLaunch(launch) {
//   latestFlightNumber++;
//   launches.set(
//     latestFlightNumber,
//     Object.assign(launch, {
//       success: true,
//       upcoming: true,
//       customer: ["zero to mastery", "NASA"],
//       flightNumber: latestFlightNumber,
//     })
//   );
// }

async function abortLaunchById(launchId) {
  const aborted = await launches.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  return aborted.modifiedCount === 1;

  // const aborted = launches.get(launchId);
  // aborted.success = false;
  // aborted.upcoming = false;
  // return aborted;
}
const SPACEX_URL = "https://api.spacexdata.com/v5/launches/query";

async function populateLaunch() {
  console.log("download launch data");
  const response = await axios.post(SPACEX_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },

        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  if (response.status !== 200) {
    console.log("problem downloading launch data");
    throw new Error("Launch data download failled");
  }
  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });
    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers,
    };
    saveLaunches(launch);
  }
}

async function loadLauchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (firstLaunch) {
    console.log("Launch already loaded");
    return;
  } else {
    await populateLaunch();
  }
}
module.exports = {
  loadLauchData,
  existLaunchId,
  getAllLaunches,
  scheduleNewLaunch,
  // addNewLaunch,
  abortLaunchById,
};
