import { asset } from "./app-store";

const USED_IMAGE_ASSETS = [
  "logo.png",
  "hero-dying-suns.webp",
  "iron.webp",
  "parchment.webp",
  "mud_with_blood_texture.jpg",
  "living-sun.webp",
  "fallen-mark.webp",
  "2d6.svg",
  "fa-print.svg",
  "fa-trash.svg",
  "arrow-rotate-right-solid.svg",
  "skull.svg",
] as const;

const preloadImage = (name: string): Promise<void> =>
  new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      void image
        .decode()
        .catch(() => undefined)
        .finally(resolve);
    };
    image.onerror = () => resolve();
    image.src = asset(name);
  });

export const preloadUsedAssets = async (): Promise<void> => {
  await Promise.all(USED_IMAGE_ASSETS.map(preloadImage));
};
