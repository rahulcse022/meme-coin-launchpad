import { MongoClient, type Collection, type Db } from "mongodb";

const uri = process.env.MONGODB_URI?.trim();

const globalForMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

function createClient() {
  return new MongoClient(uri!, {
    // Next.js route handlers can be serverless: keep the pool small per instance.
    maxPoolSize: 5,
    minPoolSize: 0,
    maxIdleTimeMS: 15_000,
  });
}

export async function getMongoClient() {
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Token records cannot be stored until MongoDB is configured.",
    );
  }

  if (!globalForMongo.mongoClientPromise) {
    globalForMongo.mongoClientPromise = createClient().connect();
  }

  return globalForMongo.mongoClientPromise;
}

export async function getLaunchpadDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db();
}

export type CreatedTokenDocument = {
  networkId: string;
  chain: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  creatorAddress: string;
  tokenAddress: string;
  transactionHash: string;
  feeAmount: string;
  feeCurrency: string;
  feeRecipient: string;
  createdAt: Date;
};

let indexesReady = false;

export async function getTokensCollection(): Promise<Collection<CreatedTokenDocument>> {
  const db = await getLaunchpadDb();
  const collection = db.collection<CreatedTokenDocument>("tokens");

  if (!indexesReady) {
    await collection.createIndexes([
      { key: { networkId: 1, transactionHash: 1 }, unique: true },
      { key: { networkId: 1, tokenAddress: 1 }, unique: true },
      { key: { creatorAddress: 1, createdAt: -1 } },
    ]);
    indexesReady = true;
  }

  return collection;
}
