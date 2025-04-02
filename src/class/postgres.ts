import {pgConfig} from "../config/config.json";
import {Pool, QueryResult} from "pg";

export class Postgres {
    private client: Pool;
    private queryResult: QueryResult;
    constructor () {
        this.connect();
    }

    private async connect () {
        this.client = new Pool(pgConfig);
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