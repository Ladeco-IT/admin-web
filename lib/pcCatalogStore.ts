import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type PcPlatform = "all" | "amd" | "intel";
export type PcBrand = "amd" | "intel" | "nvidia" | "other";

export type ManagedPcOption = {
  id: string;
  label: string;
  price: number;
  helper: string;
  imageUrl?: string;
  imageAlt?: string;
  brand?: PcBrand;
  platform?: PcPlatform;
  retailer?: string;
  productUrl?: string;
};

export type ManagedPcGroup = {
  id: string;
  label: string;
  helper: string;
  defaultOptionId: string;
  options: ManagedPcOption[];
};

export type ManagedUpgradeOption = {
  id: string;
  label: string;
  price: number;
  helper: string;
};

export type ManagedPcCatalog = {
  updatedAt: string;
  note: string;
  groups: ManagedPcGroup[];
  upgrades: ManagedUpgradeOption[];
};

const dataDirectory = path.join(process.cwd(), "data");
const dataFilePath = path.join(dataDirectory, "pc-catalog.json");

function createSeedCatalog(): ManagedPcCatalog {
  return {
    updatedAt: new Date().toISOString(),
    note: "Beheerbestand voor pc-componenten, prijzen en afbeeldingen.",
    groups: [
      {
        id: "cpu",
        label: "CPU",
        helper: "Kies CPU op basis van merk en prestaties.",
        defaultOptionId: "cpu-ryzen-5-9600x",
        options: [
          {
            id: "cpu-ryzen-5-9600x",
            label: "AMD Ryzen 5 9600X",
            price: 199.9,
            helper: "Sterke allround AMD-keuze.",
            brand: "amd",
            platform: "amd",
            imageUrl: "https://www.alternate.be/p/1200x630/1/0/AMD_Ryzen_5_9600X__3_9_GHz__5_4_GHz_Turbo_Boost__socket_AM5_processor@@100065801_30.jpg",
            imageAlt: "AMD processor",
            retailer: "ALTERNATE.be",
            productUrl: "https://www.alternate.be/AMD/Ryzen-5-9600X-3-9-GHz-5-4-GHz-Turbo-Boost-socket-AM5-processor/html/product/100065801",
          },
          {
            id: "cpu-intel-core-i5-14600kf",
            label: "Intel Core i5-14600K",
            price: 309.9,
            helper: "Sterke Intel gamingkeuze.",
            brand: "intel",
            platform: "intel",
            imageUrl: "https://www.alternate.be/p/1200x630/5/8/Intel__Core_i5_14600K__3_5_GHz__5_3_GHz_Turbo_Boost__socket_1700_processor@@100009785.jpg",
            imageAlt: "Intel processor",
            retailer: "ALTERNATE.be",
            productUrl: "https://www.alternate.be/Intel/Core-i5-14600K-3-5-GHz-5-3-GHz-Turbo-Boost-socket-1700-processor/html/product/100009785",
          },
          {
            id: "cpu-intel-core-i7-14700f",
            label: "Intel Core i7-14700KF",
            price: 419.9,
            helper: "Sterke Intel-keuze voor streaming en creatieve workloads.",
            brand: "intel",
            platform: "intel",
            imageUrl: "https://www.alternate.be/p/1200x630/1/8/Intel__Core_i7_14700KF__3_4_GHz__5_6_GHz_Turbo_Boost__socket_1700_processor@@100009781.jpg",
            imageAlt: "Intel Core i7 processor",
            retailer: "ALTERNATE.be",
            productUrl: "https://www.alternate.be/Intel/Core-i7-14700KF-3-4-GHz-5-6-GHz-Turbo-Boost-socket-1700-processor/html/product/100009781",
          },
        ],
      },
      {
        id: "motherboard",
        label: "Moederbord",
        helper: "Moet compatibel zijn met je CPU-platform.",
        defaultOptionId: "mb-b650-eagle-ax",
        options: [
          {
            id: "mb-b650-eagle-ax",
            label: "GIGABYTE B650 EAGLE AX",
            price: 129.9,
            helper: "AM5 AMD moederbord.",
            brand: "amd",
            platform: "amd",
            imageUrl: "https://www.alternate.be/p/1200x630/0/5/GIGABYTE_B650_EAGLE_AX_socket_AM5_moederbord@@100038250.jpg",
            imageAlt: "AMD motherboard",
            retailer: "ALTERNATE.be",
            productUrl: "https://www.alternate.be/GIGABYTE/B650-EAGLE-AX-socket-AM5-moederbord/html/product/100038250",
          },
          {
            id: "mb-b760-gaming-plus-wifi",
            label: "MSI B760 GAMING PLUS WIFI",
            price: 199.9,
            helper: "LGA1700 Intel moederbord.",
            brand: "intel",
            platform: "intel",
            imageUrl: "https://www.alternate.be/p/1200x630/9/0/MSI_B760_GAMING_PLUS_WIFI_socket_1700_moederbord@@1919709_30.jpg",
            imageAlt: "Intel motherboard",
            retailer: "ALTERNATE.be",
            productUrl: "https://www.alternate.be/MSI/B760-GAMING-PLUS-WIFI-socket-1700-moederbord/html/product/1919709",
          },
          {
            id: "mb-z790-gaming-plus",
            label: "MSI Z790 GAMING PLUS WIFI",
            price: 289.9,
            helper: "High-end Intel moederbord voor zware builds.",
            brand: "intel",
            platform: "intel",
            imageUrl: "https://www.alternate.be/p/1200x630/3/9/MSI_Z790_GAMING_PLUS_WIFI_socket_1700_moederbord@@100011893_30.jpg",
            imageAlt: "MSI Z790 motherboard",
            retailer: "ALTERNATE.be",
            productUrl: "https://www.alternate.be/MSI/Z790-GAMING-PLUS-WIFI-socket-1700-moederbord/html/product/100011893",
          },
        ],
      },
      {
        id: "gpu",
        label: "GPU",
        helper: "Grafische prestaties voor gaming en creatie.",
        defaultOptionId: "gpu-rtx-5060ti",
        options: [
          {
            id: "gpu-rtx-5060ti",
            label: "NVIDIA GeForce RTX 5060 Ti",
            price: 399,
            helper: "Sterke 1080p/1440p keuze.",
            brand: "nvidia",
            platform: "all",
            imageUrl: "https://www.alternate.be/p/1200x630/0/4/MSI_GeForce_RTX_5060_Ti_8G_VENTUS_2X_OC_PLUS_grafische_kaart@@100125340_30.jpg",
            imageAlt: "NVIDIA GPU",
            retailer: "ALTERNATE.be",
            productUrl: "https://www.alternate.be/MSI/GeForce-RTX-5060-Ti-8G-VENTUS-2X-OC-PLUS-grafische-kaart/html/product/100125340",
          },
        ],
      },
      {
        id: "memory",
        label: "RAM",
        helper: "Werkgeheugen voor multitask en productiviteit.",
        defaultOptionId: "ram-32gb-ddr5",
        options: [
          {
            id: "ram-32gb-ddr5",
            label: "32 GB DDR5",
            price: 139.9,
            helper: "Beste allround keuze.",
            platform: "all",
            imageUrl: "https://www.alternate.be/p/1200x630/0/6/Corsair_Vengeance_RGB_32_GB_DDR5_6000__2x_16_GB__werkgeheugen@@100020860_30.jpg",
            imageAlt: "RAM modules",
            retailer: "ALTERNATE.be",
            productUrl: "https://www.alternate.be/Corsair/Vengeance-RGB-32-GB-DDR5-6000-2x-16-GB-werkgeheugen/html/product/100020860",
          },
          {
            id: "ram-64gb-ddr5",
            label: "64 GB DDR5",
            price: 279.9,
            helper: "Voor zware creatieve workflows.",
            platform: "all",
            imageUrl: "https://www.alternate.be/p/1200x630/0/3/G_Skill_Trident_Z5_NEO_RGB_64_GB_DDR5_6000__2x_32_GB__werkgeheugen@@1875430_1.jpg",
            imageAlt: "64GB DDR5 geheugenkit",
            retailer: "ALTERNATE.be",
            productUrl: "https://www.alternate.be/G-Skill/Trident-Z5-NEO-RGB-64-GB-DDR5-6000-2x-32-GB-werkgeheugen/html/product/1875430",
          },
        ],
      },
    ],
    upgrades: [
      {
        id: "storage-2tb",
        label: "Upgrade naar 2 TB NVMe SSD",
        price: 110,
        helper: "Meer opslagruimte.",
      },
      {
        id: "cooling-upgrade",
        label: "Stillere koeling en betere airflow",
        price: 75,
        helper: "Lagere temperaturen en minder geluid.",
      },
    ],
  };
}

async function ensureStore(): Promise<void> {
  await mkdir(dataDirectory, { recursive: true });

  try {
    await readFile(dataFilePath, "utf8");
  } catch {
    const seed = createSeedCatalog();
    await writeFile(dataFilePath, JSON.stringify(seed, null, 2), "utf8");
  }
}

export async function readPcCatalog(): Promise<ManagedPcCatalog> {
  await ensureStore();
  const content = await readFile(dataFilePath, "utf8");

  try {
    const parsed = JSON.parse(content) as ManagedPcCatalog;
    if (!parsed.groups || !Array.isArray(parsed.groups)) {
      throw new Error("Catalogusstructuur ongeldig.");
    }
    return parsed;
  } catch {
    const seed = createSeedCatalog();
    await writeFile(dataFilePath, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
}

export async function writePcCatalog(input: ManagedPcCatalog): Promise<ManagedPcCatalog> {
  await ensureStore();

  const payload: ManagedPcCatalog = {
    ...input,
    updatedAt: new Date().toISOString(),
  };

  await writeFile(dataFilePath, JSON.stringify(payload, null, 2), "utf8");
  return payload;
}
