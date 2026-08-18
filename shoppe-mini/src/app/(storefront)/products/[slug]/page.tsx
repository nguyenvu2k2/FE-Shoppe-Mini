import ProductDetailLoader from "@/components/features/product/product-detail-loader";

type PageProps = {
    params: Promise<{ slug: string }>;
};

export default async function ProductSlugPage({ params }: PageProps) {
    const { slug } = await params;

    return (
        <div className="mx-auto max-w-[1200px] px-4 py-8">
            <ProductDetailLoader slug={slug} />
        </div>
    );
}
