const e = require("express");
const {
  getAllLaunches,
  scheduleNewLaunch,
  existLaunchId,
  abortLaunchById,
} = require("../../models/launches.model");
const { getPagination } = require("../../services/query");
async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
}

async function httpScheduleNewLaunch(req, res) {
  const launch = req.body;
  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.target ||
    !launch.launchDate
  ) {
    return res.status(400).json({
      error: "mising required property",
    });
  }
  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "invalid Date",
    });
  }
  await scheduleNewLaunch(launch);
  return res.status(201).json(launch);
}
async function httpAbortLaunch(req, res) {
  const launchId = +req.params.id;
  const existLaunchIds = await existLaunchId(launchId);
  if (!existLaunchIds) {
    return res.status(404).json({
      error: "launch not found",
    });
  }
  const aborted = await abortLaunchById(launchId);
  if (!aborted) {
    return res.status(400).json({
      error: "Launch not aborted",
    });
  }
  return res.status(200).json({
    ok: true,
  });
}
module.exports = {
  httpGetAllLaunches,
  httpScheduleNewLaunch,
  httpAbortLaunch,
};
