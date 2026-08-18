"use client";

import { MapPin, Plus, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";

import type { Address } from "@/lib/address.types";
import { notify } from "@/lib/toast";
import {
    createAddress,
    deleteAddress,
    listAddresses,
    setAddressDefault,
    updateAddress,
} from "@/services/user/address.service";
import AccountShell from "./account-shell";
import AccountAddressForm, {
    type AddressFormValues,
} from "./account-address-form";

const MAX_ADDRESSES = 10;

function getErrorMessage(error: unknown, fallback: string) {
    if (!isAxiosError(error)) return fallback;
    const message = (error.response?.data as { message?: string | string[] })
        ?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string" && message.trim()) return message;
    return fallback;
}

function formatAddress(address: Address) {
    return [
        address.addressLine,
        address.ward,
        address.district,
        address.province,
    ]
        .filter(Boolean)
        .join(", ");
}

function AddressesSkeleton() {
    return (
        <AccountShell>
            <div className="animate-pulse rounded-sm bg-white px-6 py-5 shadow-sm ring-1 ring-black/[0.04]">
                <div className="h-7 w-48 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-72 rounded bg-gray-100" />
                <div className="mt-5 h-px bg-gray-200" />
                <div className="mt-6 space-y-4">
                    <div className="h-28 rounded bg-gray-100" />
                    <div className="h-28 rounded bg-gray-100" />
                </div>
            </div>
        </AccountShell>
    );
}

export default function AccountAddresses() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [mode, setMode] = useState<"list" | "create" | "edit">("list");
    const [editing, setEditing] = useState<Address | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);

    const loadAddresses = useCallback(async () => {
        try {
            const { data } = await listAddresses();
            const sorted = [...(data ?? [])].sort((a, b) => {
                if (a.isDefault === b.isDefault) return 0;
                return a.isDefault ? -1 : 1;
            });
            setAddresses(sorted);
        } catch (error) {
            notify.error(
                getErrorMessage(error, "Không thể tải sổ địa chỉ.")
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAddresses();
    }, [loadAddresses]);

    const openCreate = () => {
        if (addresses.length >= MAX_ADDRESSES) {
            notify.error(`Bạn chỉ có thể lưu tối đa ${MAX_ADDRESSES} địa chỉ.`);
            return;
        }
        setEditing(null);
        setMode("create");
    };

    const openEdit = (address: Address) => {
        setEditing(address);
        setMode("edit");
    };

    const closeForm = () => {
        setMode("list");
        setEditing(null);
    };

    const handleSubmit = async (values: AddressFormValues) => {
        setSubmitting(true);
        try {
            const payload = {
                fullName: values.fullName.trim(),
                phone: values.phone.trim(),
                addressLine: values.addressLine.trim(),
                ward: values.ward.trim(),
                district: values.district.trim(),
                province: values.province.trim(),
                isDefault: values.isDefault,
            };

            if (mode === "edit" && editing) {
                const { isDefault, ...rest } = payload;
                await updateAddress(editing.id, {
                    ...rest,
                    ...(editing.isDefault ? {} : { isDefault }),
                });
                notify.success("Cập nhật địa chỉ thành công.");
            } else {
                await createAddress(payload);
                notify.success("Thêm địa chỉ thành công.");
            }

            await loadAddresses();
            closeForm();
        } catch (error) {
            notify.error(
                getErrorMessage(error, "Không thể lưu địa chỉ. Vui lòng thử lại.")
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleSetDefault = async (id: number) => {
        setBusyId(id);
        try {
            await setAddressDefault(id);
            await loadAddresses();
            notify.success("Đã đặt làm địa chỉ mặc định.");
        } catch (error) {
            notify.error(
                getErrorMessage(error, "Không thể đặt địa chỉ mặc định.")
            );
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async (address: Address) => {
        const confirmed = window.confirm(
            `Xóa địa chỉ của ${address.fullName}?`
        );
        if (!confirmed) return;

        setBusyId(address.id);
        try {
            const { data } = await deleteAddress(address.id);
            await loadAddresses();
            notify.success(data.message || "Đã xóa địa chỉ.");
        } catch (error) {
            notify.error(
                getErrorMessage(error, "Không thể xóa địa chỉ.")
            );
        } finally {
            setBusyId(null);
        }
    };

    if (loading) return <AddressesSkeleton />;

    const atLimit = addresses.length >= MAX_ADDRESSES;
    const showForm = mode === "create" || mode === "edit";

    return (
        <AccountShell>
            <div className="rounded-sm bg-white px-6 py-5 shadow-sm ring-1 ring-black/[0.04]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <span className="mt-1.5 h-5 w-1 shrink-0 rounded-full bg-[#ee4d2d]" />
                        <div>
                            <h1 className="text-xl font-normal capitalize text-[#333]">
                                Địa Chỉ Của Tôi
                            </h1>
                            <p className="mt-1 text-sm text-[#939393]">
                                Quản lý sổ địa chỉ giao hàng ({addresses.length}/
                                {MAX_ADDRESSES})
                            </p>
                        </div>
                    </div>

                    {!showForm && (
                        <button
                            type="button"
                            onClick={openCreate}
                            disabled={atLimit}
                            className="inline-flex items-center gap-1.5 rounded-sm bg-[#ee4d2d] px-4 py-2 text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Plus className="size-4" />
                            Thêm địa chỉ mới
                        </button>
                    )}
                </div>
                <div className="mt-4 h-px bg-[#efefef]" />

                {showForm ? (
                    <div className="mt-2">
                        <h2 className="text-base font-medium text-[#333]">
                            {mode === "edit"
                                ? "Cập nhật địa chỉ"
                                : "Thêm địa chỉ mới"}
                        </h2>
                        <AccountAddressForm
                            key={editing?.id ?? "create"}
                            initial={editing}
                            submitting={submitting}
                            onSubmit={handleSubmit}
                            onCancel={closeForm}
                        />
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="flex flex-col items-center py-16 text-center">
                        <div className="flex size-16 items-center justify-center rounded-full bg-[#fef6f5] text-[#ee4d2d]">
                            <MapPin className="size-7" strokeWidth={1.5} />
                        </div>
                        <p className="mt-4 text-sm font-medium text-[#333]">
                            Bạn chưa có địa chỉ nào
                        </p>
                        <p className="mt-1 text-sm text-[#999]">
                            Thêm địa chỉ để thanh toán nhanh hơn
                        </p>
                        <button
                            type="button"
                            onClick={openCreate}
                            className="mt-5 inline-flex items-center gap-1.5 rounded-sm bg-[#ee4d2d] px-4 py-2 text-sm text-white transition hover:opacity-90"
                        >
                            <Plus className="size-4" />
                            Thêm địa chỉ mới
                        </button>
                    </div>
                ) : (
                    <ul className="mt-2 divide-y divide-[#f0f0f0]">
                        {addresses.map((address) => {
                            const busy = busyId === address.id;
                            return (
                                <li
                                    key={address.id}
                                    className="flex flex-col gap-3 py-5 sm:flex-row sm:items-start sm:justify-between"
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-medium text-[#333]">
                                                {address.fullName}
                                            </p>
                                            <span className="text-[#ccc]">|</span>
                                            <p className="text-sm text-[#555]">
                                                {address.phone}
                                            </p>
                                            {address.isDefault && (
                                                <span className="inline-flex items-center gap-1 rounded-sm border border-[#ee4d2d] px-1.5 py-0.5 text-xs text-[#ee4d2d]">
                                                    <Star className="size-3 fill-[#ee4d2d]" />
                                                    Mặc định
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1.5 text-sm leading-relaxed text-[#666]">
                                            {formatAddress(address)}
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 flex-wrap items-center gap-3 text-sm">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(address)}
                                            disabled={busy}
                                            className="text-[#05a] hover:opacity-80 disabled:opacity-50"
                                        >
                                            Cập nhật
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(address)}
                                            disabled={busy}
                                            className="text-[#05a] hover:opacity-80 disabled:opacity-50"
                                        >
                                            Xóa
                                        </button>
                                        {!address.isDefault && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSetDefault(address.id)
                                                }
                                                disabled={busy}
                                                className="rounded-sm border border-[#dbdbdb] px-3 py-1.5 text-[#555] transition hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                {busy
                                                    ? "Đang xử lý..."
                                                    : "Đặt làm mặc định"}
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </AccountShell>
    );
}
