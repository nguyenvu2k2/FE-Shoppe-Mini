import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken");
    if (accessToken) {
        redirect("/shop");
    } else {
        redirect("/login");
    }
}
