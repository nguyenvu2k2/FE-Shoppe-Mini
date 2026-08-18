/** Unsplash photo id (images.unsplash.com/{id}) — ảnh stock khớp loại sản phẩm. */
export const DEMO_PRODUCT_IMAGES: Record<string, string> = {
    "Áo sơ mi nam Oxford": "photo-1562157873-818bc0726f68",
    "Quần jean slim nam": "photo-1541099649105-f69ad21f3246",
    "Váy midi hoa nhí": "photo-1572804013309-59a88b7e92f1",
    "Áo khoác denim unisex": "photo-1576995853123-5a10305d93c0",
    "Hoodie nỉ basic": "photo-1556821840-3a63f95609a7",
    "Quần short kaki": "photo-1591195853828-11db59a44f6b",
    "Áo polo pique nam": "photo-1618354691373-d851c5c3a990",
    "Chân váy tennis": "photo-1594633312681-425c7b97ccd1",
    "Áo len cổ lọ": "photo-1434389677669-e08b4cac3105",
    "Quần tây công sở": "photo-1594938298603-c8148c4dae35",
    "Áo thun oversized cotton": "photo-1521572163474-6864f9cf17ab",
    "Giày sneaker canvas": "photo-1525966222134-fcfa99b8ae77",
    "Túi tote canvas": "photo-1544816155-12df9643f363",
    "Mũ bucket trơn": "photo-1560774358-d727658f457c",
    "Thắt lưng da PU": "photo-1551028719-00167b16eac5",
    "Shoppe Phone A1": "photo-1511707171634-5f897ff02aa9",
    "Shoppe Phone A1 Pro": "photo-1592899677977-9c10ca588bbd",
    "Shoppe Phone Mini": "photo-1510557880182-3d4d3cba35a5",
    "Ốp lưng silicone A1": "photo-1601593346740-925612772716",
    "Củ sạc nhanh 20W": "photo-1583863788434-e58a36330cf0",
    "Tai nghe TWS MiniBuds": "photo-1590658268037-6bf12165a8df",
    "Cáp USB-C 1m": "photo-1572569511254-d8f925fe2cbb",
    "Sạc dự phòng 10000mAh": "photo-1625948515291-69613efd103f",
    "Kính cường lực 9H": "photo-1601784551446-20c9e07cdbdb",
    "Đế sạc không dây 15W": "photo-1583394838336-acd977736f90",
    "Giá đỡ điện thoại xe hơi": "photo-1449965408869-eaa3f722e40d",
    "Miếng dán camera": "photo-1502920917128-1aa500764cbd",
    "ShoppeBook 14": "photo-1496181133206-80ce9b88a853",
    "ShoppeBook 16 Pro": "photo-1517336714731-489689fd1ca8",
    "Balo laptop 15.6 chống sốc": "photo-1553062407-98eeb64c6a62",
    "Chuột không dây silent": "photo-1527864550417-7fd91fc51a46",
    "Bàn phím cơ mini 68 phím": "photo-1587829741301-dc798b83add3",
    "Giá đỡ laptop nhôm": "photo-1525547719571-a2d4ac8945e2",
    "Hub USB-C 7 trong 1": "photo-1625723044792-44de16ccb4e9",
    "Túi chống sốc 14 inch": "photo-1588872657578-7efd1f1555ed",
    "Đế tản nhiệt 6 quạt": "photo-1593642632823-8f785ba67e45",
};

/** Ảnh cover danh mục — keyed theo slug. */
export const DEMO_CATEGORY_IMAGES: Record<string, string> = {
    "dien-thoai": "photo-1511707171634-5f897ff02aa9",
    laptop: "photo-1496181133206-80ce9b88a853",
    "thoi-trang": "photo-1483985988355-763728e1935b",
};

const ALLOWED_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

export async function fetchDemoImageFile(
    photoId: string,
    filename: string
): Promise<File> {
    const res = await fetch(
        `/demo-image?id=${encodeURIComponent(photoId)}`
    );
    if (!res.ok) {
        throw new Error("Không tải được ảnh demo");
    }
    const blob = await res.blob();
    const type = ALLOWED_TYPES.has(blob.type) ? blob.type : "image/jpeg";
    const ext =
        type === "image/png"
            ? "png"
            : type === "image/webp"
              ? "webp"
              : type === "image/gif"
                ? "gif"
                : "jpg";
    return new File([blob], `${filename}.${ext}`, { type });
}
