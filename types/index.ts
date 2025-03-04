import { ObjectId } from "mongodb";

//User

export interface IUser {
  _id: string;
  name: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  subscription?: ISubscriptionType;
}

//Subscription

export type ISubscriptionType = {
  enabled: boolean;
  tier: ISubscriptionTier;
};

export enum ISubscriptionTier {
  NONE = "NONE",
  BASIC = "BASIC",
  SILVER = "SILVER",
  GOLD = "GOLD",
}

//Video

export type IVideo = {
  _id: ObjectId;
  title: string;
  thumbnail: string;
  description?: string;
  src: string;
  date: Date;
  category: Array<string>;
  score?: number;
  actors?: Array<IActor>;
};

//Actor

export interface IActor {
  _id: string;
  name: string;
  lastname: string;
  nickname: string;
  social: Array<ISocialMedia>;
}

//AdminUser

export interface IAdminUser extends IUser {
  role: IAdminRole;
}

export enum IAdminRole {
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN",
}

//Other types

export type ISocialMedia = {
  name?: string;
  url?: string;
};
