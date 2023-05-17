import { TRecordID } from './Common.types';

export type TUserRecordID = TRecordID<'user'>;
export type TUserRecord = {
    id: TUserRecordID;

    username: string;
    email: string;
    verified: boolean;

    firstname: string;
    lastname: string;

    picture: string;
    profile: TUserProfile;

    created: Date;
    updated: Date;
};

export type TUserProfile = {
    displayname?: string;
};

export type TPublicUserRecordID = TRecordID<'pubuser'>;
export type TPublicUserRecord = {
    id: TPublicUserRecordID;
} & Pick<TUserRecord, 'username' | 'picture' | 'profile' | 'created'>;

export type TAuthenticateUser = {
    identifier: TUserRecord['email'] | TUserRecord['username'];
    password: string;
};