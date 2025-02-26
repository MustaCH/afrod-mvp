import { MongoClient, MongoClientOptions } from "mongodb";

const uri = process.env.NEXT_MONGODB_URI as string;
const options: MongoClientOptions = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.NEXT_MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

if (process.env.NEXT_ENVIROMENT === "development") {
  // En desarrollo, usa una variable global para evitar múltiples conexiones.
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // En producción, crea una nueva conexión.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
