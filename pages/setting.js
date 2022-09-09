import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axiosInstance from "../utils/axiosInstance";

const Setting = () => {
  const router = useRouter();
  const zoomLink = `https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_ZOOM_REDIRECT_URL}`;

  const [zoomConnectSuccess, setZoomConnectSuccess] = useState(false);
  const count = 0;
  useEffect(() => {
    const handleZoomMeet = async () => {
      if (router.query.error) {
        router.push(`/setting`);
        return;
      }
      if (router.query.code) {
        const res = await axiosInstance.post(`/connect-zoom-meet`, {
          code: router.query.code,
        });
        if (res.data.status === "success") {
          setZoomConnectSuccess(true);
          router.push(`/`);
        }
      }
    };
    if ((router.query.code || router.query.error) && count == 0) {
      handleZoomMeet();
      count++;
    }
  }, [router]);
  return (
    <div>
      <div>
        <button onClick={() => router.push(zoomLink)}>
          {zoomConnectSuccess
            ? "Connected with Zoom"
            : "Connect with Zoom Meet"}
        </button>
      </div>
    </div>
  );
};

export default Setting;
