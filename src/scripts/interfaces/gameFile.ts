import { PlayerRow } from "../player";

export interface GameFile {
  GameURL: string;
  GameId: string;
  Competitors: string;
  GameDescription: string;
  AiringNetwork: string;
  AwayScore: number;
  HomeScore: number;
  AwayPlayers: PlayerRow[];
  HomePlayers: PlayerRow[];
}
