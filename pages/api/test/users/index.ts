import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

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
  const collection = db.collection("users");

  try {
    switch (req.method) {
      case "OPTIONS":
        res.status(200).end(); // Respuesta vacía para preflight
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
        const formPostUser = formidable();
        formPostUser.parse(req, async (err, fields, files) => {
          if (err) {
            console.error("Error parsing form:", err);
            return res
              .status(500)
              .json({ error: "Error al procesar la solicitud" });
          }

          const newDocument = {
            name: Array.isArray(fields.name)
              ? fields.name[0]
              : fields.name || "",
            lastname: Array.isArray(fields.lastname)
              ? fields.lastname[0]
              : fields.lastname || "",
            username: Array.isArray(fields.username)
              ? fields.username[0]
              : fields.username || "",
            email: Array.isArray(fields.email)
              ? fields.email[0]
              : fields.email || "",
            password: Array.isArray(fields.password)
              ? fields.password[0]
              : fields.password || "",
            subscription: Array.isArray(fields.subscription)
              ? fields.subscription[0]
              : fields.subscription || "",
            role: Array.isArray(fields.role)
              ? fields.role[0]
              : fields.role || "user",
          };

          try {
            const createResult = await collection.insertOne(newDocument);
            res.status(201).json({
              data: { ...newDocument, id: createResult.insertedId.toString() },
            });
          } catch (e) {
            console.error(e);
            res.status(500).json({ error: "Error al crear el usuario" });
          }
        });
        break;

      case "PUT":
        const formPutUser = formidable();
        formPutUser.parse(req, async (err, fields, files) => {
          if (err) {
            console.error("Error parsing form:", err);
            return res
              .status(500)
              .json({ error: "Error al procesar la solicitud" });
          }

          const id = Array.isArray(fields.id) ? fields.id[0] : fields.id;
          const updateData = {
            name: Array.isArray(fields.name) ? fields.name[0] : fields.name,
            lastname: Array.isArray(fields.lastname)
              ? fields.lastname[0]
              : fields.lastname,
            username: Array.isArray(fields.username)
              ? fields.username[0]
              : fields.username,
            email: Array.isArray(fields.email) ? fields.email[0] : fields.email,
            password: Array.isArray(fields.password)
              ? fields.password[0]
              : fields.password || "",
            subscription: Array.isArray(fields.subscription)
              ? fields.subscription[0]
              : fields.subscription || "",
            role: Array.isArray(fields.role) ? fields.role[0] : fields.role,
          };

          try {
            await collection.updateOne(
              { _id: new ObjectId(id) },
              { $set: updateData }
            );
            const updatedDocument = await collection.findOne({
              _id: new ObjectId(id),
            });
            if (!updatedDocument) {
              return res.status(404).json({ error: "Usuario no encontrado" });
            }
            res.status(200).json({
              data: { ...updatedDocument, id: updatedDocument._id.toString() },
            });
          } catch (e) {
            console.error(e);
            res.status(500).json({ error: "Error al actualizar el usuario" });
          }
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
