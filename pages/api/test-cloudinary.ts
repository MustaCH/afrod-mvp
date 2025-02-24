import { NextApiRequest, NextApiResponse } from "next";
import cloudinary from "../../lib/cloudinary";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const result = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      { folder: "test" }
    );

    res.status(200).json({ result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Unable to upload image" });
  }
}
