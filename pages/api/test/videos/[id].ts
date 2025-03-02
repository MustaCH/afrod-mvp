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
  const collection = db.collection("videos");

  const { id } = req.query;

  if (!ObjectId.isValid(id as string)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    switch (req.method) {
      case "GET":
        const user = await collection.findOne({
          _id: new ObjectId(id as string),
        });
        if (!user)
          return res.status(404).json({ error: "Video no encontrado" });

        return res
          .status(200)
          .json({ data: { ...user, id: user._id.toString() } });

      case "PUT":
        const { _id, ...updateData } = req.body; // 🔥 Filtra _id

        await collection.updateOne(
          { _id: new ObjectId(id as string) },
          { $set: updateData }
        );

        return res
          .status(200)
          .json({ message: "Video actualizado correctamente" });

      case "DELETE":
        await collection.deleteOne({ _id: new ObjectId(id as string) });
        return res
          .status(200)
          .json({ message: "Video eliminado correctamente" });

      default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res
          .status(405)
          .json({ error: `Método ${req.method} no permitido` });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}
