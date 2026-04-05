import { MongoClient } from "mongodb";
const uri = process.env.MONGODB_URI;
export default async function handler(req, res) {
const client = new MongoClient(uri);
try {
await client.connect();
const db = client.db("company-app");
const data = await db.collection("test").find().toArray();
res.status(200).json({ success: true, data });
} catch (error) {
res.status(500).json({ error: error.message });
} finally {
await client.close();
}
}
