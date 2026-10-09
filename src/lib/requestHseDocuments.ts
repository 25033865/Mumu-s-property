import { supabase } from "./supabaseClient";

export default async function requestHseDocuments(client = supabase) {
  const { data: auth, error: authError } = await client.auth.getUser();
  if (authError && authError.name !== "AuthSessionMissingError") throw new Error(authError.message);
  if (!auth.user?.email_confirmed_at) return { requiresSignIn: true as const };

  const user = auth.user;
  const { data: request, error } = await client.from("service_requests").insert({
    user_id: user.id,
    requester_name: [user.user_metadata?.first_name, user.user_metadata?.last_name].filter(Boolean).join(" ") || user.email,
    company_name: user.user_metadata?.company || null,
    category: "HSE Documentation",
    requirements: "Please provide the relevant HSE, quality, product and supplier documentation for our client qualification process. Please contact me through my account if further details are required.",
    location: "Client qualification — documentation request; site to be confirmed",
    urgency: "Medium",
  }).select("id, reference").single();
  if (error) throw new Error(error.message);
  if (!request?.reference) throw new Error("Could not confirm your request. Please check My Requests before trying again.");
  return { requiresSignIn: false as const, reference: String(request.reference) };
}
