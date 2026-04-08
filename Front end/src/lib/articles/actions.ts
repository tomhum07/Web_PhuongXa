"use server";

import { revalidatePath } from "next/cache";

export async function revalidateArticles() {
  revalidatePath("/dashboard/editor");
}