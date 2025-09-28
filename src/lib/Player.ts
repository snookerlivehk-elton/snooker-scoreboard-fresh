export class Player {
    public score: number = 0;
    public frames: number = 0;
    public highBreaks: { score: number; time: number }[] = [];
    public misses: number = 0;
    public safeties: number = 0;
    public fouls: number = 0;

    constructor(public name: string, public shortName: string) {}

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
        const newPlayer = new Player(this.name, this.shortName);
        newPlayer.score = this.score;
        newPlayer.frames = this.frames;
        newPlayer.highBreaks = [...this.highBreaks];
        newPlayer.misses = this.misses;
        newPlayer.safeties = this.safeties;
        newPlayer.fouls = this.fouls;
        return newPlayer;
    }
}