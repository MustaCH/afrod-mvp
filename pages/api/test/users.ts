import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { IUser } from "@/types";
import Cors from "cors";


// Inicializar CORS
const cors = Cors({
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Métodos permitidos
  origin: "http://localhost:3000", // Origen permitido (React-Admin)
});

// Helper para manejar CORS con Next.js
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Obtener todos los documentos (READ)
async function getDocuments(collection: any) {
  const documents = await collection.find({}).limit(10).toArray();
  return {
    data: documents.map((doc: IUser) => ({
      id: doc._id.toString(), // Convertir _id a id
      ...doc,
    })),
    total: documents.length,
  };
}

// Crear un nuevo documento (CREATE)
async function createDocument(collection: any, document: any) {
  if (!document) {
    throw new Error("Documento no proporcionado");
  }
  const result = await collection.insertOne(document);
  return {
    data: {
      id: result.insertedId.toString(), // Convertir _id a id
      ...document,
    },
  };
}

// Actualizar un documento existente (UPDATE)
async function updateDocument(collection: any, id: string, updateData: any) {
  if (!id || !updateData) {
    throw new Error("ID o datos no proporcionados");
  }
  await collection.updateOne(
    { _id: new ObjectId(id) }, // Convertir id a ObjectId
    { $set: updateData }
  );
  const updatedDocument = await collection.findOne({ _id: new ObjectId(id) });
  return {
    data: {
      id: updatedDocument._id.toString(), // Convertir _id a id
      ...updatedDocument,
    },
  };
}

// Eliminar un documento (DELETE)
async function deleteDocument(collection: any, id: string) {
  if (!id) {
    throw new Error("ID no proporcionado");
  }
  await collection.deleteOne({ _id: new ObjectId(id) });
  return {
    data: {
      id: id, // Devolver el id eliminado
    },
  };
}

// Handler principal
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  const client = await clientPromise;
  const db = client.db("afrod");
  const collection = db.collection("users");

  try {
    switch (req.method) {
      case "GET":
        const { data, total } = await getDocuments(collection);
        res.status(200).json({ data, total });
        break;

      case "POST":
        const newDocument = req.body;
        const { data: createdData } = await createDocument(collection, newDocument);
        res.status(201).json({ data: createdData });
        break;

      case "PUT":
        const { id, ...updateData } = req.body;
        const { data: updatedData } = await updateDocument(collection, id, updateData);
        res.status(200).json({ data: updatedData });
        break;

      case "DELETE":
        const { id: deleteId } = req.body;
        const { data: deletedData } = await deleteDocument(collection, deleteId);
        res.status(200).json({ data: deletedData });
        break;

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        res.status(405).json({ error: `Método ${req.method} no permitido` });
        break;
    }
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "Error en el servidor";
    res.status(500).json({ error: errorMessage });
  }
}