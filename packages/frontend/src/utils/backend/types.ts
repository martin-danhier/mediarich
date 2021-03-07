/**
 * @file Various types used in the MediarichAPIHandler
 * @version 1.0
 * @author Martin Danhier
 */

import { JSONInnerObject } from 'utils/api-client';

export type MediarichResponseJSON = { error: boolean } & JSONInnerObject;

// == Add ==

/**
 * Body of a /user/add route. All fields need to be set.
 */
export interface UserAddBody extends JSONInnerObject {
    username: string;
    password: string;
    apiKey: string;
}

/**
 * Exit status of a /user/add route
 */
export enum UserAddResult {
    /** The user was added successfully */
    Added,
    /** The username is already taken */
    Conflict,
    /** There was an error, see logs */
    Error
}

// == Login ==

/** Body of a /user/login route. All fields need to be set.  */
export interface UserLoginBody extends JSONInnerObject {
    username: string;
    password: string;
}

/** Exit status of a /user/login route */
export enum UserLoginResult {
    /** The user was logged in successfully */
    LoggedIn,
    /** Couldn't login (wrong credentials) */
    Unauthorized,
    /** Couldn't login (unknown error, see logs) */
    Error
}

// == Edit ==

/** Body of a /user/edit route. All fields need to be set.  */
export interface UserEditBody extends JSONInnerObject {
    username: string;
    newPassword?: string;
    newApiKey?: string;
}

/** Exit status of a /user/login route */
export enum UserEditResult {
    /** The user was edited successfully */
    Edited,
    /** Couldn't edit (not enough permission or not logged in) */
    Unauthorized,
    /** Couldn't edit (unknown error, see logs) */
    Error
}

// == Test ==

/** Exit status of a /user/test route */
export enum UserTestResult {
    /** The user is connected */
    Connected,
    /** The user is not connected */
    NotConnected,
    /** Couldn't test (unknown error, see logs) */
    Error
}