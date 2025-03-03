import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const client = await clientPromise;
    const db = client.db("afrod");
    const collection = db.collection("actors");

    if (req.method === "DELETE") {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({ error: "Se requiere un array de IDs válido" });
      }

      if (!ids.every((id) => typeof id === "string")) {
        return res
          .status(400)
          .json({ error: "Todos los IDs deben ser strings" });
      }

      const objectIds = ids
        .filter((id) => ObjectId.isValid(id))
        .map((id) => new ObjectId(id));

      console.log("🔹 ObjectIds convertidos:", objectIds);

      if (objectIds.length === 0) {
        return res
          .status(400)
          .json({ error: "Ningún ID válido proporcionado para eliminar" });
      }

      const result = await collection.deleteMany({ _id: { $in: objectIds } });

      console.log("🔹 Resultado de deleteMany:", result);

      return res.json({ success: true, deletedCount: result.deletedCount });
    }

    return res.status(405).json({ error: "Método no permitido" });
  } catch (error) {
    console.error("❌ Error en /bulk DELETE:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
