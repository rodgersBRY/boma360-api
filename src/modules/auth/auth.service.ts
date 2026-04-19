import { createSupabaseClient, getUserFromAccessToken } from "../../config/db";
import { UnauthorizedError } from "../../config/errors";
import { organizationsService } from "../organizations/organizations.service";
import { RefreshTokenInput, SignInInput, SignUpInput } from "./auth.types";

export class AuthService {
  async signUp(input: SignUpInput) {
    const client = createSupabaseClient();
    const { data, error } = await client.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          ...(input.full_name && { full_name: input.full_name }),
          ...(input.phone && { phone: input.phone }),
        },
      },
    });

    if (error) throw error;
    if (!data.user) return data;

    const { organization } = await organizationsService.createOrganizationForUser(
      data.user.id,
      input.farm_name,
    );

    return { ...data, organization };
  }

  async signIn(input: SignInInput) {
    const client = createSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) throw error;

    return data;
  }

  async refreshSession(input: RefreshTokenInput) {
    const client = createSupabaseClient();
    const { data, error } = await client.auth.refreshSession({
      refresh_token: input.refresh_token,
    });

    if (error) throw error;

    if (!data.session) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    return data;
  }

  async getMe(accessToken?: string) {
    if (!accessToken) {
      throw new UnauthorizedError("Missing bearer token");
    }

    const user = await getUserFromAccessToken(accessToken);
    if (!user) {
      throw new UnauthorizedError("Invalid or expired access token");
    }

    return user;
  }
}

export const authService = new AuthService();
