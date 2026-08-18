import { redirect } from "next/navigation";

/** Alias theo prompt: /signin → /login */
export default function SignInAliasPage() {
    redirect("/login");
}
