"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Address } from "@/lib/address.types";
import {
    findDistrictByName,
    findProvinceByName,
    findWardByName,
    getDistrictsByProvinceId,
    getProvinces,
    getWardsByDistrictId,
    type Commune,
    type District,
    type Province,
} from "@/lib/vn-locations";

const addressSchema = z.object({
    fullName: z.string().trim().min(1, "Vui lòng nhập họ tên"),
    phone: z
        .string()
        .trim()
        .regex(/^0\d{9,10}$/, "Số điện thoại không hợp lệ"),
    addressLine: z.string().trim().min(1, "Vui lòng nhập địa chỉ"),
    province: z.string().trim().min(1, "Vui lòng chọn tỉnh/thành phố"),
    district: z.string().trim().min(1, "Vui lòng chọn quận/huyện"),
    ward: z.string().trim().min(1, "Vui lòng chọn phường/xã"),
    isDefault: z.boolean(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

interface AccountAddressFormProps {
    initial?: Address | null;
    submitting: boolean;
    onSubmit: (values: AddressFormValues) => Promise<void>;
    onCancel: () => void;
}

const inputClassName =
    "w-full rounded-sm border border-[#dbdbdb] px-3 py-2 text-sm outline-none transition focus:border-[#ee4d2d] focus:shadow-[0_0_0_1px_#ee4d2d]";

const selectClassName =
    "w-full rounded-sm border border-[#dbdbdb] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#ee4d2d] focus:shadow-[0_0_0_1px_#ee4d2d] disabled:cursor-not-allowed disabled:bg-[#f5f5f5] disabled:text-[#999]";

function FormField({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-sm text-[#555]">{label}</label>
            {children}
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
}

export default function AccountAddressForm({
    initial,
    submitting,
    onSubmit,
    onCancel,
}: AccountAddressFormProps) {
    const isEdit = Boolean(initial);
    const isCurrentDefault = Boolean(initial?.isDefault);

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Commune[]>([]);
    const [provinceId, setProvinceId] = useState("");
    const [districtId, setDistrictId] = useState("");
    const [loadingLocations, setLoadingLocations] = useState(true);

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            fullName: initial?.fullName ?? "",
            phone: initial?.phone ?? "",
            addressLine: initial?.addressLine ?? "",
            province: initial?.province ?? "",
            district: initial?.district ?? "",
            ward: initial?.ward ?? "",
            isDefault: initial?.isDefault ?? false,
        },
    });

    useEffect(() => {
        let active = true;

        const bootstrap = async () => {
            try {
                const provinceList = await getProvinces();
                if (!active) return;
                setProvinces(provinceList);

                if (!initial?.province) return;

                const matchedProvince =
                    findProvinceByName(provinceList, initial.province) ??
                    provinceList.find((item) =>
                        item.name
                            .toLowerCase()
                            .includes(initial.province.toLowerCase())
                    );

                if (!matchedProvince) return;

                setProvinceId(matchedProvince.idProvince);
                setValue("province", matchedProvince.name);

                const districtList = await getDistrictsByProvinceId(
                    matchedProvince.idProvince
                );
                if (!active) return;
                setDistricts(districtList);

                if (!initial.district) return;

                const matchedDistrict =
                    findDistrictByName(districtList, initial.district) ??
                    districtList.find((item) =>
                        item.name
                            .toLowerCase()
                            .includes(initial.district.toLowerCase())
                    );

                if (!matchedDistrict) return;

                setDistrictId(matchedDistrict.idDistrict);
                setValue("district", matchedDistrict.name);

                const wardList = await getWardsByDistrictId(
                    matchedDistrict.idDistrict
                );
                if (!active) return;
                setWards(wardList);

                if (!initial.ward) return;

                const matchedWard =
                    findWardByName(wardList, initial.ward) ??
                    wardList.find((item) =>
                        item.name
                            .toLowerCase()
                            .includes(initial.ward.toLowerCase())
                    );

                if (matchedWard) {
                    setValue("ward", matchedWard.name);
                }
            } finally {
                if (active) setLoadingLocations(false);
            }
        };

        bootstrap();
        return () => {
            active = false;
        };
    }, [initial, setValue]);

    const handleProvinceChange = async (nextProvinceId: string) => {
        setProvinceId(nextProvinceId);
        setDistrictId("");
        setDistricts([]);
        setWards([]);

        const provinceName =
            provinces.find((item) => item.idProvince === nextProvinceId)
                ?.name ?? "";
        setValue("province", provinceName, { shouldValidate: true });
        setValue("district", "", { shouldValidate: true });
        setValue("ward", "", { shouldValidate: true });

        if (!nextProvinceId) return;
        setDistricts(await getDistrictsByProvinceId(nextProvinceId));
    };

    const handleDistrictChange = async (nextDistrictId: string) => {
        setDistrictId(nextDistrictId);
        setWards([]);

        const districtName =
            districts.find((item) => item.idDistrict === nextDistrictId)
                ?.name ?? "";
        setValue("district", districtName, { shouldValidate: true });
        setValue("ward", "", { shouldValidate: true });

        if (!nextDistrictId) return;
        setWards(await getWardsByDistrictId(nextDistrictId));
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-5 grid gap-4 sm:grid-cols-2"
        >
            <FormField label="Họ và tên" error={errors.fullName?.message}>
                <input
                    {...register("fullName")}
                    type="text"
                    className={inputClassName}
                    placeholder="Nguyễn Văn A"
                />
            </FormField>

            <FormField label="Số điện thoại" error={errors.phone?.message}>
                <input
                    {...register("phone")}
                    type="tel"
                    inputMode="numeric"
                    className={inputClassName}
                    placeholder="0912345678"
                />
            </FormField>

            <div className="sm:col-span-2">
                <FormField
                    label="Địa chỉ cụ thể"
                    error={errors.addressLine?.message}
                >
                    <input
                        {...register("addressLine")}
                        type="text"
                        className={inputClassName}
                        placeholder="Số nhà, tên đường"
                    />
                </FormField>
            </div>

            <FormField
                label="Tỉnh / Thành phố"
                error={errors.province?.message}
            >
                <Controller
                    name="province"
                    control={control}
                    render={() => (
                        <select
                            className={selectClassName}
                            disabled={loadingLocations || submitting}
                            value={provinceId}
                            onChange={(event) => {
                                void handleProvinceChange(event.target.value);
                            }}
                        >
                            <option value="">
                                {loadingLocations
                                    ? "Đang tải..."
                                    : "Chọn tỉnh/thành phố"}
                            </option>
                            {provinces.map((item) => (
                                <option
                                    key={item.idProvince}
                                    value={item.idProvince}
                                >
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    )}
                />
            </FormField>

            <FormField label="Quận / Huyện" error={errors.district?.message}>
                <Controller
                    name="district"
                    control={control}
                    render={() => (
                        <select
                            className={selectClassName}
                            disabled={
                                !provinceId || loadingLocations || submitting
                            }
                            value={districtId}
                            onChange={(event) => {
                                void handleDistrictChange(event.target.value);
                            }}
                        >
                            <option value="">
                                {!provinceId
                                    ? "Chọn tỉnh trước"
                                    : "Chọn quận/huyện"}
                            </option>
                            {districts.map((item) => (
                                <option
                                    key={item.idDistrict}
                                    value={item.idDistrict}
                                >
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    )}
                />
            </FormField>

            <div className="sm:col-span-2">
                <FormField label="Phường / Xã" error={errors.ward?.message}>
                    <Controller
                        name="ward"
                        control={control}
                        render={({ field }) => {
                            const wardId =
                                wards.find((item) => item.name === field.value)
                                    ?.idCommune ?? "";

                            return (
                                <select
                                    className={selectClassName}
                                    disabled={
                                        !districtId ||
                                        loadingLocations ||
                                        submitting
                                    }
                                    value={wardId}
                                    onChange={(event) => {
                                        const nextWardId = event.target.value;
                                        const wardName =
                                            wards.find(
                                                (item) =>
                                                    item.idCommune ===
                                                    nextWardId
                                            )?.name ?? "";
                                        field.onChange(wardName);
                                    }}
                                >
                                    <option value="">
                                        {!districtId
                                            ? "Chọn quận/huyện trước"
                                            : "Chọn phường/xã"}
                                    </option>
                                    {wards.map((item) => (
                                        <option
                                            key={item.idCommune}
                                            value={item.idCommune}
                                        >
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            );
                        }}
                    />
                </FormField>
            </div>

            <div className="sm:col-span-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[#333]">
                    <input
                        type="checkbox"
                        {...register("isDefault")}
                        disabled={isCurrentDefault}
                        className="size-4 accent-[#ee4d2d] disabled:cursor-not-allowed"
                    />
                    Đặt làm địa chỉ mặc định
                    {isCurrentDefault && (
                        <span className="text-[#999]">(đang là mặc định)</span>
                    )}
                </label>
            </div>

            <div className="flex flex-wrap gap-3 sm:col-span-2">
                <button
                    type="submit"
                    disabled={submitting || loadingLocations}
                    className="min-w-[120px] rounded-sm bg-[#ee4d2d] px-6 py-2.5 text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {submitting
                        ? "Đang lưu..."
                        : isEdit
                          ? "Cập nhật"
                          : "Thêm địa chỉ"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    className="rounded-sm border border-[#dbdbdb] bg-white px-6 py-2.5 text-sm text-[#555] transition hover:bg-gray-50 disabled:opacity-70"
                >
                    Hủy
                </button>
            </div>
        </form>
    );
}
