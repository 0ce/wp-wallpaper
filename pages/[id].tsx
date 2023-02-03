import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import useSWR from "swr";
import Loading from "../components/Loading";

function fetcher(url: string) {
  return fetch(url).then((r) => r.json());
}

function getApiUrl(id: string) {
  return `https://nft-apis.vercel.app/api/metadata?contract_address=0x3acce66cd37518a6d77d9ea3039e00b3a2955460&token_id=${id}`;
}

function getCanvasSize() {
  let w: number | string = window.screen.width * window.devicePixelRatio;
  let h: number | string = window.screen.height * window.devicePixelRatio;
  if (w > h) {
    // on desktop
    h = window.innerHeight;
    w = h / 2;
  }
  return { width: w, heigth: h };
}

const Canvas: FC<{ image: HTMLImageElement; logo: HTMLImageElement | null }> = ({ image,logo }) => {
  const [result, setResult] = useState("");

  useEffect(() => {
    if (image === null || logo === null) {
      return;
    }

    const { width, heigth } = getCanvasSize();
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = heigth;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, 0, 0);
    const { data: bgColor } = ctx.getImageData(1, 1, 1, 1);
    const { data: bgColor2 } = ctx.getImageData(1, 200, 1, 1);
    const { data: bgColor3 } = ctx.getImageData(1, 1700, 1, 1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = `rgb(${bgColor[0]},${bgColor[1]},${bgColor[2]})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const imageSize = (bgColor[0] !== bgColor2[0] || bgColor[1] !== bgColor2[1] || bgColor[0] !== bgColor3[0] || bgColor[1] !== bgColor3[1]) ? canvas.width : Math.floor((canvas.width * 6) / 7);

    const logoWidth = imageSize / 3;
    const logoHeight = logoWidth * 0.93;

    ctx.drawImage(
      logo,
      (imageSize - logoWidth) / 2,
      (canvas.height - imageSize - logoHeight) / 1.25,
      logoWidth,
      logoHeight
    );


    ctx.drawImage(image, (canvas.width - imageSize) / 2, canvas.height - imageSize, imageSize, imageSize);

    const dataUrl = canvas.toDataURL("image/png");
    setResult(dataUrl);
  }, [image]);

  if (!result) {
    return <Loading />;
  }

  return <img src={result} />;
};

const WallpaperPage: FC = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);

  const { data } = useSWR(id ? getApiUrl(id) : null, fetcher);

  useEffect(() => {
    const i = new Image();
    i.src = "/logo.svg";

    i.crossOrigin = "Anonymous";
    i.onload = function () {
      setLogo(i);
    };
  }, []);

  useEffect(() => {
    if (!data?.image) {
      return;
    }
    const img = new Image();
    img.onload = function () {
      setImage(img);
    };
    img.crossOrigin = "Anonymous";
    img.src = data.image;
  }, [data?.image]);

  if (!id || !data || !image) {
    return <Loading />;
  }

  return <Canvas image={image} logo={logo}/>;
};

export default WallpaperPage;
