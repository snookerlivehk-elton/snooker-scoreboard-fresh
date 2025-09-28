import { Player } from './Player';

// As per the data structure design suggestion
interface Shot {
    player: number; // Index of the player
    ball?: 'red' | 'yellow' | 'green' | 'brown' | 'blue' | 'pink' | 'black';
    points: number;
    type: 'pot' | 'foul' | 'safety' | 'break';
    timestamp: number;
}

export class State {
    // Match Info
    public players: Player[];
    public settings: {
        matchName: string;
        redBalls: number;
        framesRequired: number;
    };

    // Current State
    public frame: number;
    public currentPlayerIndex: number;
    public redsRemaining: number;
    public pottedColors: number[];
    public mustPotRed: boolean;
    public isFreeBall: boolean;
    public isFrameOver: boolean;
    public isMatchOver: boolean;
    public isRespotBlack: boolean;
    public isClearingColours: boolean;
    public breakScore: number;
    public breakTime: number; // in seconds
    public status: 'playing' | 'paused' | 'ended';

    // History for Undo
    public history: State[];

    // Shot History
    public shotHistory: Shot[];

    // Timers
    public timers: {
        frameTime: number; // in seconds
        matchTime: number; // in seconds
    };

    constructor(
        playersInfo: { name: string, shortName: string, handicap: number }[] = [
            { name: 'Player 1', shortName: 'P1', handicap: 0 },
            { name: 'Player 2', shortName: 'P2', handicap: 0 }
        ],
        settings: { matchName: string, redBalls: number, framesRequired: number } = { matchName: 'Snooker Match', redBalls: 15, framesRequired: 1 },
        startingPlayerIndex: number = 0
    ) {
        // Match Info
        this.players = playersInfo.map(p => new Player(p.name, p.shortName, p.handicap));
        this.settings = settings;

        // Apply handicap to initial scores
        this.players.forEach((player) => {
            player.score = player.handicap;
        });

        // Current State
        this.frame = 1;
        this.currentPlayerIndex = startingPlayerIndex;
        this.redsRemaining = this.settings.redBalls;
        this.pottedColors = [];
        this.mustPotRed = true;
        this.isFreeBall = false;
        this.isFrameOver = false;
        this.isMatchOver = false;
        this.isRespotBlack = false;
        this.isClearingColours = false;
        this.breakScore = 0;
        this.breakTime = 0;
        this.status = 'playing';

        // History for Undo
        this.history = [];

        // Shot History
        this.shotHistory = [];

        // Timers
        this.timers = {
            frameTime: 0,
            matchTime: 0,
        };
    }

    // e.g., pot, foul, switchPlayer, etc.
    public pot(ballValue: number): void {
        this.saveState();

        if (this.isRespotBlack) {
            if (ballValue === 7) { // Black ball
                this.players[this.currentPlayerIndex].add_points(7);
                this.isFrameOver = true;
            } else {
                // Foul: potting the wrong ball during respot black
                this.foul(ballValue);
            }
            this.checkFrameOver();
            return;
        }

        // If we are already clearing colours, validate the sequence.
        if (this.isClearingColours) {
            const expectedSequence = [2, 3, 4, 5, 6, 7];
            const nextBallInSequence = expectedSequence[this.pottedColors.length];
            if (ballValue !== nextBallInSequence) {
                // Invalid pot during clearing sequence
                this.miss();
                return;
            }
        }

        const player = this.players[this.currentPlayerIndex];
        let points = ballValue;

        if (this.isFreeBall && ballValue > 1) {
            points = 1;
        }

        player.add_points(points);
        this.breakScore += points;

        if (ballValue === 1) { // Potted a red
            if (!this.isFreeBall && this.redsRemaining > 0) {
                this.redsRemaining--;
            }
            this.mustPotRed = false;
        } else { // Potted a color
            if (this.isClearingColours) {
                // This is a valid color in the clearing sequence
                if (!this.isFreeBall) {
                    this.pottedColors.push(ballValue);
                }
                if (this.pottedColors.length === 6 && ballValue === 7) { // Potted final black
                    if (this.players[0].score === this.players[1].score) {
                        this.isRespotBlack = true;
                    } else {
                        this.isFrameOver = true;
                    }
                }
            } else { // Not yet clearing colours
                if (this.redsRemaining > 0) {
                    // This is a color potted while reds are on the table
                    this.mustPotRed = true;
                } else {
                    // This is the color potted right after the last red.
                    // Now, the clearing of colours will begin.
                    this.isClearingColours = true;
                    // DO NOT add this ball to pottedColors.
                    // The next ball to be potted will be the yellow (2).
                }
            }
        }

        this.shotHistory.push({
            player: this.currentPlayerIndex,
            ball: this.getBallName(ballValue),
            points: points,
            type: 'pot',
            timestamp: Date.now(),
        });

        // After a pot, it's no longer a free ball
        this.isFreeBall = false;

        this.checkFrameOver();
    }

    public toggleFreeBall(): void {
        this.isFreeBall = !this.isFreeBall;
    }

    public foul(penalty: number): void {
        this.saveState();

        if (this.isRespotBlack) {
            const opponentIndex = 1 - this.currentPlayerIndex;
            this.players[opponentIndex].add_points(penalty);
            this.isFrameOver = true;
            this.checkFrameOver();
            return;
        }

        // Rule: Foul on final black
        if (this.redsRemaining === 0 && this.pottedColors.length === 6) {
            this.isFrameOver = true;
            const opponentIndex = 1 - this.currentPlayerIndex;
            this.players[opponentIndex].add_frame();
            return;
        }

        // Check for high break before resetting
        if (this.breakScore >= 20) {
            this.players[this.currentPlayerIndex].add_high_break(this.breakScore, this.breakTime);
        }

        // The opponent gets the points
        const opponentIndex = 1 - this.currentPlayerIndex;
        this.players[opponentIndex].add_points(penalty);

        // Increment the foul count for the current player
        this.players[this.currentPlayerIndex].fouls++;

        // Reset the break score of the current player
        this.breakScore = 0;
        this.breakTime = 0;

        // Record the foul in the shot history against the player who fouled
        this.shotHistory.push({
            player: this.currentPlayerIndex,
            points: penalty,
            type: 'foul',
            timestamp: Date.now(),
        });

        // Switch to the other player
        this.currentPlayerIndex = opponentIndex;

        // It's now a free ball for the other player
        this.isFreeBall = true;

        this.checkFrameOver();
    }

    public miss(): void {
        this.saveState();
        this.players[this.currentPlayerIndex].misses++;
        this.switchPlayer();
    }

    public safe(): void {
        this.saveState();
        this.players[this.currentPlayerIndex].safeties++;
        this.switchPlayer();
    }

    public switchPlayer(): void {
        this.saveState();
        // Check for high break before switching
        if (this.breakScore >= 20) {
            this.players[this.currentPlayerIndex].add_high_break(this.breakScore, this.breakTime);
        }
        this.breakScore = 0;
        this.breakTime = 0;
        this.currentPlayerIndex = 1 - this.currentPlayerIndex;
        this.mustPotRed = this.redsRemaining > 0;
        this.isFreeBall = false; // A simple switch does not trigger a free ball
    }

    public undo(): void {
        if (this.history.length > 0) {
            const prevState = this.history.pop();
            if (prevState) {
                Object.assign(this, prevState);
                // Re-instantiate Player objects
                this.players = prevState.players.map((playerData: any) => {
                    const player = new Player(playerData.name, playerData.shortName);
                    player.score = playerData.score;
                    player.frames = playerData.frames;
                    player.highBreaks = playerData.highBreaks;
                    player.misses = playerData.misses;
                    player.safeties = playerData.safeties;
                    player.fouls = playerData.fouls;
                    return player;
                });
            }
        }
    }

    public concedeFrame(): void {
        this.saveState();
        const opponentIndex = 1 - this.currentPlayerIndex;
        this.players[opponentIndex].add_frame();

        if (this.players[opponentIndex].frames >= Math.ceil(this.settings.framesRequired / 2)) {
            this.isMatchOver = true;
        } else {
            this.startNextFrame();
        }
    }

    public startNextFrame(): void {
        // Reset scores for the new frame to the player's original handicap
        this.players.forEach(p => p.score = p.handicap);

        // Reset frame-specific state
        this.frame++;
        this.redsRemaining = this.settings.redBalls;
        this.pottedColors = [];
        this.isFreeBall = false;
        this.isFrameOver = false;
        this.isRespotBlack = false;
        this.isClearingColours = false;
        this.breakScore = 0;
        this.breakTime = 0;
        this.status = 'playing';
        this.shotHistory = [];
        this.timers.frameTime = 0;

        // Alternate starting player for the new frame (P1 starts odd frames, P2 starts even frames)
        this.currentPlayerIndex = (this.frame - 1) % 2;
    }

    public getRemainingPoints(): number {
        if (this.redsRemaining > 0) {
            return this.redsRemaining * 8 + 27;
        } else {
            const colourValues = [2, 3, 4, 5, 6, 7];
            const remainingColours = colourValues.filter(v => !this.pottedColors.includes(v));
            return remainingColours.reduce((a, b) => a + b, 0);
        }
    }

    private checkFrameOver(): void {
        if (this.isFrameOver) {
            this.awardFrameToWinner();
            return;
        }

        const p1 = this.players[0];
        const p2 = this.players[1];

        // Case 2: All balls potted (black is the last one)
        if (this.isClearingColours && this.pottedColors.length === 6) {
            if (p1.score === p2.score) {
                this.isRespotBlack = true;
                this.pottedColors.pop(); // Un-pot the black for the respot
            } else {
                this.isFrameOver = true;
            }
        }

        if (this.isFrameOver) {
            this.awardFrameToWinner();
        }
    }

    private awardFrameToWinner(): void {
        const p1 = this.players[0];
        const p2 = this.players[1];
        let winnerIndex;

        if (p1.score !== p2.score) {
            winnerIndex = p1.score > p2.score ? 0 : 1;
        } else {
            // This case should only be hit on a foul on the final black,
            // where scores are equal. The player who did not foul wins.
            // foul() has already switched players, so the current player is the winner.
            winnerIndex = this.currentPlayerIndex;
        }

        this.players[winnerIndex].add_frame();

        const framesToWin = Math.ceil(this.settings.framesRequired / 2);
        if (this.players[winnerIndex].frames >= framesToWin) {
            this.isMatchOver = true;
        }
    }

    private getBallName(ballValue: number): 'red' | 'yellow' | 'green' | 'brown' | 'blue' | 'pink' | 'black' {
        switch (ballValue) {
            case 1: return 'red';
            case 2: return 'yellow';
            case 3: return 'green';
            case 4: return 'brown';
            case 5: return 'blue';
            case 6: return 'pink';
            case 7: return 'black';
            default: throw new Error(`Invalid ball value: ${ballValue}`);
        }
    }

    private saveState(): void {
        const stateToSave = { ...this };
        delete (stateToSave as any).history;
        const stateCopy = JSON.parse(JSON.stringify(stateToSave));
        this.history.push(stateCopy);
        if (this.history.length > 10) {
            this.history.shift(); // Keep only the last 10 states
        }
    }

    public tick(): void {
        if (this.status === 'playing') {
            this.timers.frameTime++;
            this.timers.matchTime++;
            if (this.breakScore > 0) {
                this.breakTime++;
            }
        }
    }
}