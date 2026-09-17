/** Vite `base` 下的静态资源路径。GitHub Pages 是 `/myriad/`。 */
export function publicAsset(path: string): string {
  const base = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  return `${base}${path.replace(/^\//, "")}`;
}

export const brandLogoSrc = publicAsset("logo.svg");
