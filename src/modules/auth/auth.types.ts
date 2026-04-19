export interface SignUpInput {
  email: string;
  password: string;
  farm_name: string;
  full_name?: string;
  phone?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface RefreshTokenInput {
  refresh_token: string;
}
