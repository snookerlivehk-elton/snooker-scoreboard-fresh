export class Player {
    public name: string;
    public shortName: string;
    public score: number;
    public frames: number;
    public highBreaks: { score: number; time: number }[];
    public misses: number;
    public safeties: number;
    public fouls: number;
    public handicap: number;

    constructor(name: string, shortName: string, handicap: number = 0) {
        this.name = name;
        this.shortName = shortName;
        this.score = 0;
        this.frames = 0;
        this.highBreaks = [];
        this.misses = 0;
        this.safeties = 0;
        this.fouls = 0;
        this.handicap = handicap;
    }

    public add_points(points: number): void {
        this.score += points;
    }

    public subtract_points(points: number): void {
        this.score -= points;
    }

    public add_frame(): void {
        this.frames++;
    }

    public reset_score(): void {
        this.score = 0;
    }

    public add_high_break(breakScore: number, breakTime: number): void {
        this.highBreaks.push({ score: breakScore, time: breakTime });
    }

    public clone(): Player {
        const newPlayer = new Player(this.name, this.shortName, this.handicap);
        newPlayer.score = this.score;
        newPlayer.frames = this.frames;
        newPlayer.highBreaks = [...this.highBreaks];
        newPlayer.misses = this.misses;
        newPlayer.safeties = this.safeties;
        newPlayer.fouls = this.fouls;
        return newPlayer;
    }

    public toJSON(): any {
        return {
            name: this.name,
            shortName: this.shortName,
            score: this.score,
            frames: this.frames,
            highBreaks: this.highBreaks,
            misses: this.misses,
            safeties: this.safeties,
            fouls: this.fouls,
            handicap: this.handicap,
        };
    }

    public static fromJSON(json: any): Player {
        const player = new Player(json.name, json.shortName, json.handicap);
        player.score = json.score;
        player.frames = json.frames;
        player.highBreaks = json.highBreaks;
        player.misses = json.misses;
        player.safeties = json.safeties;
        player.fouls = json.fouls;
        return player;
    }
}