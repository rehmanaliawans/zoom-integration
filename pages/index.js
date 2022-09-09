import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { TextField, Button, Typography } from "@mui/material";
import moment from "moment";
import axiosInstance from "../utils/axiosInstance";
import { useRouter } from "next/router";
export default function Home() {
  const router = useRouter();
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [zoomToken, setZoomToken] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  let count = 0;
  useEffect(() => {
    if (count == 0) {
      axiosInstance
        .get(`/get-zoom-token`)
        .then((res) => {
          console.log("res", res);
          if (res.data.status === "success") setZoomToken(res.data.token);
        })
        .catch((err) => {
          setZoomToken("");
        });
      count++;
    }
  }, []);
  const handleScheduleMeeting = () => {
    //format the time

    const data = {
      meetingTime: moment.utc(selectedTime).format(),
      duration: 10,
      zoom_token: zoomToken,
      email: email,
    };
    axiosInstance
      .post(`/post-meeting`, data)
      .then((res) => {
        if (res.data.status === "success") {
          setMessage("Meeting Scheduled Successfully");
        }
        if (res.data.status === "warning") {
          setMessage(res.data.message);
        }
      })
      .catch((err) => {
        console.log("err", err.response);
      });
  };
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div style={{ padding: "20px" }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <TimePicker
              label="Time"
              value={selectedTime}
              onChange={(newValue) => setSelectedTime(newValue)}
              renderInput={(params) => <TextField size="small" {...params} />}
            />
          </LocalizationProvider>

          <TextField
            type="email"
            label="email"
            required
            size="small"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </div>

        <div style={{ padding: "20px" }}>
          {zoomToken === "" ? (
            <Button onClick={() => router.push("/setting")} type="submit">
              Connect with Zoom
            </Button>
          ) : (
            <Button onClick={handleScheduleMeeting} type="submit">
              Schedule Meeting
            </Button>
          )}

          <Typography variant="subtitle1">
            {message !== "" ? message : ""}
          </Typography>
        </div>
      </main>
    </div>
  );
}
