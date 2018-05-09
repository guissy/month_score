import * as moment from 'moment';
type Level = '' | 'A' | 'B' | 'C' | 'D';
export interface ScoreItem {
  rateBoss: number;
  rateSelf?: number;
  about: string;
  levelBoss: Level;
  levelSelf: Level;
}

export interface Score {
  hard: ScoreItem;
  speed: ScoreItem;
  reactive: ScoreItem;
  test: ScoreItem;
  quality: ScoreItem;
  grow: ScoreItem;
  team: ScoreItem;
  meeting: ScoreItem;

  uid: number;
  job: string;
  part: string;
  truename: string;
  parent: string;
  date: moment.Moment;
  dateType: 'month' | 'quarter' | 'halfYear';
  createdTime?: moment.Moment;
  finishBoss?: boolean;
  finishSelf?: boolean;
}
