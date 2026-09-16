import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = "admin" | "client";

export async function getCurrentUserRole() {
	const { data: userData, error: userError } = await supabase.auth.getUser();
	if (userError || !userData.user) {
		return { role: null as UserRole | null, error: userError };
	}

	const { data, error } = await supabase
		.from("user_roles")
		.select("role")
		.eq("user_id", userData.user.id)
		.maybeSingle();

	return {
		role: (data?.role === "admin" || data?.role === "client" ? data.role : null) as UserRole | null,
		error,
	};
}