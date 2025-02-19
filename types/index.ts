//User

export type IUser = {
    name: string,
    lastname: string,
    username: string,
    email: string,
    password: string,
    subscription?: ISubscriptionType
}

//Subscription

export type ISubscriptionType = {
    enabled: boolean,
    tier: ISubscriptionTier
}

export enum ISubscriptionTier {
    NONE = 'NONE',
    BASIC = 'BASIC',
    SILVER = 'SILVER',
    GOLD = 'GOLD',
  }