import {Injectable, NotFoundException, BadRequestException} from '@nestjs/common';
import {Game} from "./entities/game.entity";
import {Postgres} from "../class/postgres";
import {CreateGameDto} from "./dto/create-game.dto";

@Injectable()
export class GamesService {
    private games: Game[] = [];
    private pg: Postgres = new Postgres();

    private clear(): void {
        this.games = [];
    }
    async getAll(): Promise<Game[]> {
        await this.pg.query('SELECT * FROM games');
        this.clear();
        this.pg.getRows().rows.forEach((r) => {
            this.games.push({
                game_id: r.game_id,
                title: r.title,
                release_date: r.release_date,
                genres: r.genres
            })
        });
        return this.games;
    }

    async getOne(id: number): Promise<Game> {
        await this.pg.query('SELECT * FROM games WHERE game_id = $1', [id]);
        const result = this.pg.getRows();
        if (result.rowCount < 1) {
            throw new NotFoundException("Oh no!");
        }
        return {
            game_id: result.rows[0].game_id,
            title: result.rows[0].title,
            release_date: result.rows[0].release_date,
            genres: result.rows[0].genres
        };
    }

    async create (gameData: CreateGameDto): Promise<void> {
        try {
            await this.pg.query(`INSERT INTO games (game_id, title, release_date, genres) VALUES ($1, $2, $3, $4)`, [gameData.game_id, gameData.title, gameData.release_date, gameData.genres]);
        } catch (e) {
            console.log(e);
            throw new BadRequestException(e.message);
        }
    }
}
