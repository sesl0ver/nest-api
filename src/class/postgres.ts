import {Pool, QueryResult} from "pg";
import { config } from "dotenv";

export class Postgres {
    private client: Pool;
    private queryResult: QueryResult;
    constructor () {
        this.connect();
    }

    private async connect () {
        config()
        this.client = new Pool({
            host: process.env.REACT_APP_PG_HOST,
            port: Number(process.env.REACT_APP_PG_PORT),
            user: process.env.REACT_APP_PG_USER,
            password: process.env.REACT_APP_PG_PASSWORD,
            database: process.env.REACT_APP_PG_DATABASE
        });
        await this.client.connect();
    }

    public async query (query_string: string, query_params: any[] = []) {
        this.queryResult = await this.client.query(query_string, query_params);
    }

    public getRows () {
        return {
            rowCount: this.queryResult?.rowCount ?? 0,
            rows: this.queryResult?.rows ?? []
        };
    }
}