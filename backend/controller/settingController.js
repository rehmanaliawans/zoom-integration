const Setting = require("../model/settingModel");
const request = require("request");
const { base64encode } = require("nodejs-base64");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const { google } = require("googleapis");
const { OAuth2 } = google.auth;
exports.connectZoom = async (req, res, next) => {
  const { code } = req.body;
  try {
    if (code) {
      //convert the clientId and client_secret to base64 string and send as authorization header

      const authorization = Buffer.from(
        process.env.ZOOM_CLIENT_ID + ":" + process.env.ZOOM_CLIENT_SECRET,
      );

      var options = {
        method: "POST",
        url: "https://zoom.us/oauth/token",
        qs: {
          grant_type: "authorization_code",
          code: req.body.code,
          redirect_uri: `${process.env.ZOOM_REDIRECT_URL}`,
        },
        headers: {
          Authorization: `Basic ${authorization.toString("base64")}`,
        },
      };

      request(options, async function (error, response, body) {
        if (error) throw new Error(error);

        const data = JSON.parse(body);
        if (data.refresh_token) {
          const date = new Date();
          console.log("data", data);
          const addData = await Setting.create({
            token: data.refresh_token,
            tokenExpire: date.setFullYear(date.getFullYear() + 15),
          });
          res.status(201).json({
            status: "success",
            token: addData.token,
          });
        } else {
          res.status(401).json({
            status: "error",
            message: "refresh token expired",
          });
        }
      });
    } else {
      res.status(401).json({
        status: "error",
        message: "Code is missing",
      });
    }
  } catch (err) {
    res.status(401).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

exports.getZoomMeetToken = async (req, res, next) => {
  try {
    const data = await Setting.findOne();

    if (data) {
      res.status(201).json({
        status: "success",
        token: data.token,
      });
    } else {
      res.status(401).json({
        status: "error",
        message: "Not connected with google Meet",
      });
    }
  } catch (err) {
    res.status(401).json({
      status: "error",
      message: "Not connected with google Meet",
    });
  }
};
exports.postMeeting = async (req, res, next) => {
  const meetingInfo = req.body;

  const zoomMeetingDetails = {
    type: 2,
    duration: meetingInfo.duration,
    start_time: new Date(meetingInfo.interviewTime),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    settings: {
      meeting_authentication: true,
    },
  };
  if (meetingInfo.zoom_token !== "") {
    console.log("token", meetingInfo.zoom_token);
    const meetingOptions = {
      method: "POST",
      url: "https://api.zoom.us/v2/users/me/meetings",
      headers: {
        Authorization: `Bearer ${meetingInfo.zoom_token}`,
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(zoomMeetingDetails),
    };
    request(meetingOptions, function (error, response, body) {
      if (error) return next(new AppError(error, 404));

      var meetingData = JSON.parse(body);
      res.status(200).json({
        status: "success",
        link: meetingData.join_url,
      });
    });
  } else {
    return res.json({
      status: "error",
      message: "Please login with Account",
    });
  }
};
