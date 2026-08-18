import CategoryDetailView from "@/components/features/product/category-detail-view";

type PageProps = {
    params: Promise<{ slug: string }>;
};

export default async function CategorySlugPage({ params }: PageProps) {
    const { slug } = await params;

    return (
        <div className="mx-auto max-w-[1200px] px-4 py-8">
            <CategoryDetailView slug={slug} />
        </div>
    );
}
