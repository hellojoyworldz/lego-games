const SEO = {
  siteName: "Perfect Ten",
  title: "Perfect Ten",
  description: "Tap numbers to make 10!",
  imagePath: "assets/images/og-image.png",
  faviconPath: "assets/images/favicon.png",
  imageAlt: "Perfect Ten — tap numbers to make 10",
  themeColor: "#f472b6",
  locale: "en_US",
  localeAlternate: "ko_KR",
};

/** @param {string} path */
function resolveAssetUrl(path) {
  return new URL(path, document.baseURI).href;
}

/** 공유·검색용 meta는 영어 고정. og:image 등 상대 URL을 절대 URL로 보정. */
export function initSeo() {
  const pageUrl = `${location.origin}${location.pathname}`.replace(/\/index\.html$/, "/");
  const imageUrl = resolveAssetUrl(SEO.imagePath);

  document.querySelector('meta[name="description"]')?.setAttribute(
    "content",
    SEO.description,
  );
  document.querySelector('meta[property="og:site_name"]')?.setAttribute(
    "content",
    SEO.siteName,
  );
  document.querySelector('meta[property="og:title"]')?.setAttribute(
    "content",
    SEO.title,
  );
  document.querySelector('meta[property="og:description"]')?.setAttribute(
    "content",
    SEO.description,
  );
  document.querySelector('meta[property="og:url"]')?.setAttribute("content", pageUrl);
  document.querySelector('meta[property="og:image"]')?.setAttribute(
    "content",
    imageUrl,
  );
  document.querySelector('meta[property="og:image:alt"]')?.setAttribute(
    "content",
    SEO.imageAlt,
  );
  document.querySelector('meta[name="twitter:title"]')?.setAttribute(
    "content",
    SEO.title,
  );
  document.querySelector('meta[name="twitter:description"]')?.setAttribute(
    "content",
    SEO.description,
  );
  document.querySelector('meta[name="twitter:image"]')?.setAttribute(
    "content",
    imageUrl,
  );
  document.querySelector('meta[name="twitter:image:alt"]')?.setAttribute(
    "content",
    SEO.imageAlt,
  );

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = pageUrl;

  const faviconUrl = resolveAssetUrl(SEO.faviconPath);
  document.querySelector('link[rel="icon"]')?.setAttribute("href", faviconUrl);
  document.querySelector('link[rel="apple-touch-icon"]')?.setAttribute(
    "href",
    faviconUrl,
  );
}
