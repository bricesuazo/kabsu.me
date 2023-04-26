import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

export { notes } from "./schema/schema";

const config = {
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
};

const connection = connect(config);

export const db = drizzle(connection);
