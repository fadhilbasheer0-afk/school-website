"use server";

import {
  fail,
  str,
  bool,
  isEmail,
  requireAdminOrNull,
} from "./shared";
import { createClient } from "@/lib/supabase/server";
import { revalidateContent } from "@/lib/admin/revalidate";
import type { ActionResult } from "@/lib/admin/types";

export async function saveSettings(input: {
  id?: string;
  school_name?: string;
  tagline?: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;
  website_url?: string;
  map_url?: string;
  coordinates?: string;
  footer_about?: string;
  footer_copyright?: string;
  office_hours?: { label: string; value: string }[];
  social_links?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  contact_form?: {
    enabled?: boolean;
    recipient_email?: string;
    subject_prefix?: string;
  };
  currency?: string;
  timezone?: string;
}): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  if (!session.schoolId) return fail("No school attached to this account.");

  const contactEmail = str(input.contact_email);
  if (contactEmail && !isEmail(contactEmail)) {
    return fail("Enter a valid contact email.");
  }
  const formRecipient = str(input.contact_form?.recipient_email);
  if (formRecipient && !isEmail(formRecipient)) {
    return fail("Enter a valid contact-form recipient email.");
  }

  const officeHours = Array.isArray(input.office_hours)
    ? input.office_hours
        .map((o) => ({ label: str(o?.label), value: str(o?.value) }))
        .filter((o) => o.label || o.value)
    : [];

  const socialLinks =
    input.social_links && typeof input.social_links === "object"
      ? {
          facebook: str(input.social_links.facebook),
          twitter: str(input.social_links.twitter),
          instagram: str(input.social_links.instagram),
          linkedin: str(input.social_links.linkedin),
          youtube: str(input.social_links.youtube),
        }
      : {};

  const contactForm = {
    enabled: bool(input.contact_form?.enabled, true),
    recipient_email: str(input.contact_form?.recipient_email),
    subject_prefix: str(input.contact_form?.subject_prefix),
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("school_settings")
    .update({
      school_name: str(input.school_name),
      tagline: str(input.tagline),
      logo_url: str(input.logo_url),
      favicon_url: str(input.favicon_url),
      primary_color: str(input.primary_color),
      secondary_color: str(input.secondary_color),
      contact_email: contactEmail || null,
      contact_phone: str(input.contact_phone),
      contact_address: str(input.contact_address),
      website_url: str(input.website_url),
      map_url: str(input.map_url),
      coordinates: str(input.coordinates),
      footer_about: str(input.footer_about),
      footer_copyright: str(input.footer_copyright),
      office_hours: JSON.stringify(officeHours),
      social_links: JSON.stringify(socialLinks),
      contact_form: JSON.stringify(contactForm),
      currency: str(input.currency) || "USD",
      timezone: str(input.timezone) || "UTC",
    })
    .eq("school_id", session.schoolId);

  if (error) return fail(error.message);
  revalidateContent("school_settings");
  return { ok: true };
}
