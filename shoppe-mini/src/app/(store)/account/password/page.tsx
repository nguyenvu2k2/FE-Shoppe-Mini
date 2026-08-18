import { redirect } from "next/navigation";

/** Alias cũ → canonical /account/security theo prompt */
export default function AccountPasswordAliasPage() {
    redirect("/account/security");
}
