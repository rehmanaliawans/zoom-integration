const express = require("express");
const router = express.Router();
const settingController = require("../controller/settingController");

router.post("/connect-zoom-meet", settingController.connectZoom);
router.get("/get-zoom-token", settingController.getZoomMeetToken);
router.post("/post-meeting", settingController.postMeeting);

module.exports = router;
