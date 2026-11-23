import { redirect } from "next/navigation";
export default async function TurkishProductAlias({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; redirect(`/tr/products/${slug}`); }
