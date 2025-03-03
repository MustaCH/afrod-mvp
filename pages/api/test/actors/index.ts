import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";

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
  const collection = db.collection("actors");

  try {
    switch (req.method) {
      case "OPTIONS":
        res.status(200).end();
        break;

      case "GET":
        const { _start, _end, _sort, _order } = req.query;
        const limit = Number(_end) - Number(_start);
        const sortField = _sort || "id";
        const sortOrder = _order === "ASC" ? 1 : -1;

        const documents = await collection
          .find({})
          .sort({ [sortField as string]: sortOrder })
          .skip(Number(_start))
          .limit(limit)
          .toArray();

        const total = await collection.countDocuments({});

        res.status(200).json({
          data: documents.map((doc) => ({
            id: doc._id.toString(), // Convertir _id a id
            ...doc,
          })),
          total,
        });
        break;

      case "POST":
        const newDocument = req.body;
        const createResult = await collection.insertOne(newDocument);
        res.status(201).json({
          data: { ...newDocument, id: createResult.insertedId.toString() },
        });
        break;

      case "PUT":
        const { id, ...updateData } = req.body;
        await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        const updatedDocument = await collection.findOne({
          _id: new ObjectId(id),
        });
        if (!updatedDocument) {
          return res.status(404).json({ error: "Document not found" });
        }
        res.status(200).json({
          data: { ...updatedDocument, id: updatedDocument._id.toString() },
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
