export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: "owner" | "member";
  created_at: string;
}
