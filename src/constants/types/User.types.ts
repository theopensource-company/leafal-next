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

    preferredName: string;
    status?: 'offline' | 'online' | 'ingame';
};

export type TUserProfile = {
    displayname?: string;
};

export type TPublicUserRecordID = TRecordID<'pubuser'>;
export type TPublicUserRecord = {
    id: TPublicUserRecordID;
} & Pick<
    TUserRecord,
    'preferredName' | 'username' | 'picture' | 'profile' | 'created' | 'status'
>;

export type TActionSignInUser = {
    identifier: TUserRecord['email'] | TUserRecord['username'];
    password: string;
};

export type TActionSignUpUser = {
    username: TUserRecord['username'];
    email: TUserRecord['email'];
    firstname: TUserRecord['firstname'];
    lastname: TUserRecord['lastname'];
    password: string;
};
