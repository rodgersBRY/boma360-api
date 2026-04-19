import { createSupabaseAdminClient } from "../../config/db";
import { Organization, OrganizationMember } from "./organizations.types";

export class OrganizationsService {
  private get admin() {
    return createSupabaseAdminClient();
  }

  async createOrganizationForUser(
    userId: string,
    farmName: string,
  ): Promise<{ organization: Organization; member: OrganizationMember }> {
    const { data: org, error: orgError } = await this.admin
      .from("organizations")
      .insert({ name: farmName })
      .select("*")
      .maybeSingle();

    if (orgError) throw orgError;
    if (!org) throw new Error("Failed to create organization");

    const { data: member, error: memberError } = await this.admin
      .from("organization_members")
      .insert({ organization_id: org.id, user_id: userId, role: "owner" })
      .select("*")
      .maybeSingle();

    if (memberError) throw memberError;
    if (!member) throw new Error("Failed to create organization membership");

    return { organization: org, member };
  }

  async getOrganizationByUserId(userId: string): Promise<Organization | null> {
    const { data, error } = await this.admin
      .from("organization_members")
      .select("organizations(*)")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return (data as any).organizations as Organization;
  }

  async getMembershipByUserId(userId: string): Promise<OrganizationMember | null> {
    const { data, error } = await this.admin
      .from("organization_members")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}

export const organizationsService = new OrganizationsService();
