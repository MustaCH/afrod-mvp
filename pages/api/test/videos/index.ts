import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { IVideoDocument } from "@/models/Video";
import clientPromise from "@/lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const client = await clientPromise;
  const db = client.db("afrod");
  const collection = db.collection("videos");

  try {
    switch (req.method) {
      case "GET":
        const { _start, _end, _sort, _order, id } = req.query;
        if (id) {
          const video = await collection.findOne({
            _id: new ObjectId(id as string),
          });
          if (!video)
            return res.status(404).json({ error: "Video no encontrado" });
          return res
            .status(200)
            .json({ data: { id: video._id.toString(), ...video } });
        }

        const limit = Number(_end) - Number(_start);
        const sortField = _sort || "date";
        const sortOrder = _order === "ASC" ? 1 : -1;

        const videos = await collection
          .find({})
          .sort({ [sortField as string]: sortOrder })
          .skip(Number(_start))
          .limit(limit)
          .toArray();

        const total = await collection.countDocuments({});
        res.status(200).json({
          data: videos.map((doc) => ({
            id: doc._id.toString(),
            ...(doc as unknown as IVideoDocument),
          })),
          total,
        });
        break;

      case "POST":
        const newVideo = req.body;
        const createResult = await collection.insertOne(newVideo);
        res.status(201).json({
          data: { ...newVideo, id: createResult.insertedId.toString() },
        });
        break;

      case "PUT":
        const { id: updateId, ...updateData } = req.body;
        await collection.updateOne(
          { _id: new ObjectId(updateId) },
          { $set: updateData }
        );
        const updatedVideo = await collection.findOne({
          _id: new ObjectId(updateId),
        });
        if (!updatedVideo)
          return res.status(404).json({ error: "Video no encontrado" });
        res.status(200).json({
          data: { ...updatedVideo, id: updatedVideo._id.toString() },
        });
        break;

      case "DELETE":
        const { id: deleteId } = req.body;
        await collection.deleteOne({ _id: new ObjectId(deleteId) });
        res.status(200).json({ data: { id: deleteId } });
        break;

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE", "OPTIONS"]);
        res.status(405).json({ error: `Método ${req.method} no permitido` });
        break;
    }
  } catch (e) {
    console.error(e);
    const errorMessage =
      e instanceof Error ? e.message : "Error en el servidor";
    res.status(500).json({ error: errorMessage });
  }
}
