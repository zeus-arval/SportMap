export interface IUser{
  email: string,
  credentials: ICredentials,
}

export interface ICredentials{
  // refreshToken?: string,
  token?: string,
  firstName?: string,
  lastName?: string,
}