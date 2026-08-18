"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, MapPin, Plus } from "lucide-react";

import AccountAddressForm, {
    type AddressFormValues,
} from "@/components/features/account/account-address-form";
import EmptyState from "@/components/ui/empty-state";
import ProductImage from "@/components/ui/product-image";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Address } from "@/lib/address.types";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format-price";
import {
    PAYMENT_METHOD_OPTIONS,
} from "@/lib/order-ui";
import type { PaymentMethod } from "@/lib/order.types";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { createOrder } from "@/services/order/order.service";
import {
    createVnpayPayment,
    redirectToVnpay,
} from "@/services/payment/payment.service";
import {
    createAddress,
    listAddresses,
} from "@/services/user/address.service";

const NOTE_MAX = 500;

export default function CheckoutView() {
    const router = useRouter();
    const cart = useCartStore((s) => s.cart);
    const isLoadingCart = useCartStore((s) => s.isLoading);
    const fetchCart = useCartStore((s) => s.fetchCart);
    const clearLocal = useCartStore((s) => s.clearLocal);

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [addressId, setAddressId] = useState<number | null>(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [savingAddress, setSavingAddress] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [vnpayError, setVnpayError] = useState<string | null>(null);

    const loadAddresses = useCallback(async () => {
        setLoadingAddresses(true);
        try {
            const { data } = await listAddresses();
            const sorted = [...(data ?? [])].sort((a, b) => {
                if (a.isDefault === b.isDefault) return 0;
                return a.isDefault ? -1 : 1;
            });
            setAddresses(sorted);
            setAddressId((current) => {
                if (current && sorted.some((a) => a.id === current)) {
                    return current;
                }
                return sorted.find((a) => a.isDefault)?.id ?? sorted[0]?.id ?? null;
            });
        } catch (error) {
            notify.error(getApiErrorMessage(error, "Không tải được sổ địa chỉ."));
        } finally {
            setLoadingAddresses(false);
        }
    }, []);

    useEffect(() => {
        const id = window.setTimeout(() => {
            void fetchCart();
            void loadAddresses();
        }, 0);
        return () => window.clearTimeout(id);
    }, [fetchCart, loadAddresses]);

    const items = useMemo(() => cart?.items ?? [], [cart?.items]);
    const unavailable = useMemo(
        () => items.filter((item) => !item.isAvailable),
        [items]
    );
    const availableItemCount = cart?.summary.availableItemCount ?? 0;
    const canSubmit =
        Boolean(addressId) &&
        availableItemCount > 0 &&
        unavailable.length === 0 &&
        items.length > 0 &&
        !submitting;

    const handleCreateAddress = async (values: AddressFormValues) => {
        setSavingAddress(true);
        try {
            const { data } = await createAddress({
                fullName: values.fullName.trim(),
                phone: values.phone.trim(),
                addressLine: values.addressLine.trim(),
                ward: values.ward.trim(),
                district: values.district.trim(),
                province: values.province.trim(),
                isDefault: values.isDefault,
            });
            notify.success("Đã thêm địa chỉ");
            setShowAddressForm(false);
            await loadAddresses();
            setAddressId(data.id);
        } catch (error) {
            notify.error(getApiErrorMessage(error, "Không lưu được địa chỉ."));
        } finally {
            setSavingAddress(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!addressId) {
            notify.error("Vui lòng chọn địa chỉ giao hàng.");
            return;
        }
        if (unavailable.length > 0) {
            notify.error(
                "Giỏ còn sản phẩm không khả dụng. Xóa hoặc sửa trước khi đặt hàng."
            );
            return;
        }
        if (availableItemCount === 0) {
            notify.error("Không có sản phẩm khả dụng để thanh toán.");
            return;
        }

        setSubmitting(true);
        setVnpayError(null);

        try {
            const trimmedNote = note.trim().slice(0, NOTE_MAX);
            const { data } = await createOrder({
                addressId,
                paymentMethod,
                ...(trimmedNote ? { note: trimmedNote } : {}),
            });

            clearLocal();
            void fetchCart();

            if (paymentMethod === "VNPAY") {
                if (data.vnpay?.paymentUrl) {
                    redirectToVnpay(data.vnpay.paymentUrl);
                    return;
                }

                if (data.vnpay == null && data.vnpayError) {
                    setVnpayError(data.vnpayError);
                    notify.error(data.vnpayError);
                    try {
                        const retry = await createVnpayPayment({
                            orderId: data.id,
                        });
                        if (retry.data.paymentUrl) {
                            redirectToVnpay(retry.data.paymentUrl);
                            return;
                        }
                    } catch (retryError) {
                        notify.error(
                            getApiErrorMessage(
                                retryError,
                                "Đơn đã tạo nhưng chưa lấy được link VNPay. Vào chi tiết đơn để thanh toán lại."
                            )
                        );
                        router.replace(`/orders/${data.id}`);
                        return;
                    }
                    router.replace(`/orders/${data.id}`);
                    return;
                }

                notify.info(
                    "Đơn đã tạo. Vào chi tiết đơn để thanh toán VNPay."
                );
                router.replace(`/orders/${data.id}`);
                return;
            }

            router.replace(`/orders/${data.id}?placed=1`);
        } catch (error) {
            notify.error(
                getApiErrorMessage(error, "Không đặt được đơn hàng.")
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoadingCart && !cart) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-28 animate-pulse rounded-xl bg-gray-200"
                    />
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <EmptyState
                title="Giỏ hàng trống"
                description="Thêm sản phẩm trước khi thanh toán."
                action={
                    <Link
                        href="/products"
                        className="inline-flex rounded-xl bg-[#ee4d2d] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
                    >
                        Tiếp tục mua sắm
                    </Link>
                }
            />
        );
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
                <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04]">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                            <MapPin className="size-4 text-[#ee4d2d]" />
                            Địa chỉ giao hàng
                        </h2>
                        {!showAddressForm && (
                            <button
                                type="button"
                                onClick={() => setShowAddressForm(true)}
                                className="inline-flex items-center gap-1 text-sm text-[#ee4d2d] hover:underline"
                            >
                                <Plus className="size-3.5" />
                                Thêm địa chỉ
                            </button>
                        )}
                    </div>

                    {loadingAddresses ? (
                        <div className="mt-4 h-20 animate-pulse rounded-lg bg-gray-100" />
                    ) : showAddressForm ? (
                        <div className="mt-3">
                            <AccountAddressForm
                                submitting={savingAddress}
                                onSubmit={handleCreateAddress}
                                onCancel={() => setShowAddressForm(false)}
                            />
                        </div>
                    ) : addresses.length === 0 ? (
                        <p className="mt-3 text-sm text-amber-700">
                            Bạn chưa có địa chỉ. Thêm địa chỉ để đặt hàng.
                        </p>
                    ) : (
                        <ul className="mt-3 space-y-2">
                            {addresses.map((address) => {
                                const selected = addressId === address.id;
                                return (
                                    <li key={address.id}>
                                        <label
                                            className={cn(
                                                "flex cursor-pointer gap-3 rounded-xl border p-3 transition",
                                                selected
                                                    ? "border-[#ee4d2d] bg-[#fef6f5]"
                                                    : "border-gray-200 hover:border-gray-300"
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                name="addressId"
                                                className="mt-1"
                                                checked={selected}
                                                onChange={() =>
                                                    setAddressId(address.id)
                                                }
                                            />
                                            <div className="min-w-0 text-sm">
                                                <p className="font-medium text-gray-900">
                                                    {address.fullName}
                                                    <span className="ml-2 font-normal text-gray-500">
                                                        {address.phone}
                                                    </span>
                                                    {address.isDefault && (
                                                        <span className="ml-2 text-xs text-[#ee4d2d]">
                                                            Mặc định
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="mt-0.5 text-gray-600">
                                                    {[
                                                        address.addressLine,
                                                        address.ward,
                                                        address.district,
                                                        address.province,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(", ")}
                                                </p>
                                            </div>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04]">
                    <h2 className="text-base font-semibold text-gray-900">
                        Phương thức thanh toán
                    </h2>
                    <ul className="mt-3 space-y-2">
                        {PAYMENT_METHOD_OPTIONS.map((opt) => (
                            <li key={opt.value}>
                                <label
                                    className={cn(
                                        "flex cursor-pointer gap-3 rounded-xl border p-3 transition",
                                        paymentMethod === opt.value
                                            ? "border-[#ee4d2d] bg-[#fef6f5]"
                                            : "border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        className="mt-1"
                                        checked={paymentMethod === opt.value}
                                        onChange={() =>
                                            setPaymentMethod(opt.value)
                                        }
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {opt.label}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {opt.hint}
                                        </p>
                                    </div>
                                </label>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04]">
                    <h2 className="text-base font-semibold text-gray-900">
                        Ghi chú
                    </h2>
                    <textarea
                        value={note}
                        onChange={(e) =>
                            setNote(e.target.value.slice(0, NOTE_MAX))
                        }
                        rows={3}
                        placeholder="Ghi chú cho shop (không bắt buộc)"
                        className="mt-3 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#ee4d2d]"
                    />
                    <p className="mt-1 text-right text-xs text-gray-400">
                        {note.length}/{NOTE_MAX}
                    </p>
                </section>

                <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04]">
                    <h2 className="text-base font-semibold text-gray-900">
                        Sản phẩm
                    </h2>
                    {unavailable.length > 0 && (
                        <p className="mt-2 inline-flex items-center gap-1 text-sm text-amber-700">
                            <AlertTriangle className="size-4" />
                            Có sản phẩm hết hàng. Vui lòng chỉnh sửa{" "}
                            <Link href="/cart" className="underline">
                                giỏ hàng
                            </Link>
                            .
                        </p>
                    )}
                    <ul className="mt-3 divide-y divide-gray-100">
                        {items.map((item) => (
                            <li
                                key={item.id}
                                className={cn(
                                    "flex gap-3 py-3",
                                    !item.isAvailable && "opacity-60"
                                )}
                            >
                                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                    <ProductImage
                                        src={item.product?.thumbnail}
                                        alt={item.product?.name ?? ""}
                                        sizes="56px"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="line-clamp-2 text-sm font-medium text-gray-900">
                                        {item.product?.name ??
                                            `Sản phẩm #${item.productId}`}
                                    </p>
                                    {item.variant && (
                                        <p className="text-xs text-gray-500">
                                            {item.variant.name}
                                        </p>
                                    )}
                                    {!item.isAvailable && (
                                        <p className="text-xs text-amber-700">
                                            Không khả dụng
                                        </p>
                                    )}
                                </div>
                                <div className="text-right text-sm">
                                    <p className="text-gray-500">
                                        ×{item.quantity}
                                    </p>
                                    <p className="font-medium text-[#ee4d2d]">
                                        {formatPrice(item.lineTotal)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04] lg:sticky lg:top-24">
                <h2 className="text-base font-semibold text-gray-900">
                    Tóm tắt
                </h2>
                <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <dt>Tạm tính</dt>
                        <dd>{formatPrice(cart?.summary.subtotal ?? 0)}</dd>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <dt>Phí vận chuyển</dt>
                        <dd>0₫</dd>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-3 text-base">
                        <dt className="font-medium text-gray-900">
                            Tổng
                        </dt>
                        <dd className="font-semibold text-[#ee4d2d]">
                            {formatPrice(cart?.summary.subtotal ?? 0)}
                        </dd>
                    </div>
                </dl>

                {vnpayError && (
                    <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        {vnpayError}
                    </p>
                )}

                <button
                    type="button"
                    disabled={!canSubmit}
                    onClick={() => void handlePlaceOrder()}
                    className="mt-5 w-full rounded-xl bg-[#ee4d2d] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                >
                    {submitting
                        ? "Đang đặt hàng..."
                        : paymentMethod === "VNPAY"
                          ? "Đặt hàng & thanh toán VNPay"
                          : "Đặt hàng"}
                </button>
                <Link
                    href="/cart"
                    className="mt-3 block text-center text-sm text-gray-500 hover:text-[#ee4d2d]"
                >
                    Quay lại giỏ hàng
                </Link>
            </aside>
        </div>
    );
}
