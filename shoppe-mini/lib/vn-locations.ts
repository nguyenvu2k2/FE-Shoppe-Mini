import { Districts, Provinces } from "vietnam-divisions-js";
import type { Commune } from "vietnam-divisions-js/communes";
import type { District } from "vietnam-divisions-js/districts";
import type { Province } from "vietnam-divisions-js/provinces";

export type { Commune, District, Province };

function sortByName<T extends { name: string }>(items: T[]) {
    return [...items].sort((a, b) =>
        a.name.localeCompare(b.name, "vi", { sensitivity: "base" })
    );
}

export async function getProvinces() {
    return sortByName(await Provinces.getAllProvince());
}

export async function getDistrictsByProvinceId(provinceId: string) {
    if (!provinceId) return [];
    return sortByName(await Provinces.getDistrictsByProvinceId(provinceId));
}

export async function getWardsByDistrictId(districtId: string) {
    if (!districtId) return [];
    return sortByName(await Districts.getCommunesByDistrictId(districtId));
}

export function findProvinceByName(
    provinces: Province[],
    name: string
): Province | undefined {
    const target = name.trim().toLowerCase();
    return provinces.find((item) => item.name.trim().toLowerCase() === target);
}

export function findDistrictByName(
    districts: District[],
    name: string
): District | undefined {
    const target = name.trim().toLowerCase();
    return districts.find((item) => item.name.trim().toLowerCase() === target);
}

export function findWardByName(
    wards: Commune[],
    name: string
): Commune | undefined {
    const target = name.trim().toLowerCase();
    return wards.find((item) => item.name.trim().toLowerCase() === target);
}
