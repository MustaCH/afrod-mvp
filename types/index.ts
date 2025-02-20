//User

export type IUser = {
  name: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  subscription?: ISubscriptionType;
};

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
  title: string;
  description?: string;
  src: string;
  date: Date;
  score?: number;
};

//AdminUser

export type IAdminUser = {
  name: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  role: IAdminRole;
};

export enum IAdminRole {
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN",
}
