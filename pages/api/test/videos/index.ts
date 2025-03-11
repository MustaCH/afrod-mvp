import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { IVideoDocument } from "@/models/Video";
import clientPromise from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import formidable from "formidable";
import fs from "fs";

// 🔹 Desactivar el bodyParser de Next.js (IMPORTANTE para formidable)
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3001");
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
        const form = formidable({ keepExtensions: true, multiples: false });

        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error("Error parsing form:", err);
            return res
              .status(500)
              .json({ error: "Error al procesar el formulario" });
          }

          // Validar campos y archivo
          const file = Array.isArray(files.file) ? files.file[0] : files.file;
          if (!file?.filepath) {
            return res.status(400).json({ error: "Archivo no subido" });
          }

          try {
            // Subir a Cloudinary
            const uploadResult = await cloudinary.uploader.upload(
              file.filepath,
              {
                resource_type: "video",
                folder: "videos",
              }
            );

            // Crear objeto para MongoDB
            const newVideo = {
              title: fields.title?.[0] || "",
              description: fields.description?.[0] || "",
              src: uploadResult.secure_url,
              thumbnail: `https://res.cloudinary.com/dqe1pmyf8/video/upload/w_300,h_200,c_fill/so_2/${uploadResult.public_id}.jpg`,
              date: new Date(fields.date?.[0] || Date.now()),
              actors: fields.actors
                ? Array.isArray(fields.actors)
                  ? fields.actors
                  : [fields.actors]
                : [],
              score: 0,
            };

            // Insertar en MongoDB
            const createResult = await collection.insertOne(newVideo);
            const responseData = {
              id: createResult.insertedId.toString(),
              ...newVideo,
              date: newVideo.date.toISOString(), // Convertir a string para React-Admin
            };

            // Eliminar archivo temporal
            fs.unlink(file.filepath, () => {});

            // Enviar respuesta
            return res.status(201).json({ data: responseData }); // 🔹 ¡Usar return aquí!
          } catch (uploadError) {
            console.error("Error en el proceso:", uploadError);
            return res.status(500).json({ error: "Error al subir el video" });
          }
        });
        break;

      case "PUT":
        const { id: updateId, ...updateData } = req.body;
        const updateResult = await collection.updateOne(
          { _id: new ObjectId(updateId) },
          { $set: updateData }
        );

        if (updateResult.matchedCount === 0) {
          return res.status(404).json({ error: "Video no encontrado" });
        }

        const updatedVideo = await collection.findOne({
          _id: new ObjectId(updateId),
        });
        if (!updatedVideo) {
          return res
            .status(404)
            .json({ error: "Video no encontrado después de la actualización" });
        }
        res.status(200).json({
          data: { ...updatedVideo, id: updatedVideo._id.toString() },
        });
        break;

      case "DELETE":
        const { id: deleteId } = req.body;
        const deleteResult = await collection.deleteOne({
          _id: new ObjectId(deleteId),
        });

        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ error: "Video no encontrado" });
        }

        res.status(200).json({ data: { id: deleteId } });
        break;

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE", "OPTIONS"]);
        res.status(405).json({ error: `Método ${req.method} no permitido` });
        break;
    }
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ error: e instanceof Error ? e.message : "Error en el servidor" });
  }
}
