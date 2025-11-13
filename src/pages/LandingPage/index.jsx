import { Link, useLocation } from "react-router-dom";
import { shops } from "../../shopsData.js";
import { useState, useEffect, useRef } from "react";

const withBase = (path = "") => {
    const base = import.meta.env.BASE_URL || "/";
    return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
};

const DEFAULT_MAP_SRC = withBase("Etc/all@4x.png");
const FALLBACK_MAP_SVG = withBase("svg/all.svg");
const HERO_TITLE_ENG = withBase("4x/white eng@4x.png");
const HERO_TITLE_KOR = withBase("4x/white kor@4x.png");
const HERO_LOGO_BLACK_ENG = withBase("4x/black eng@4x.png");
const HERO_LOGO_BLACK_KOR = withBase("4x/black kor@4x.png");
const SEARCH_ICON = withBase("search-icon.svg");
const LANDING_DIR_ENC = withBase("landing%20first");

const LandingPage = () => {
    const location = useLocation();

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [mapSrc, setMapSrc] = useState(DEFAULT_MAP_SRC);

    // ---- Region utilities ----
    const regionSlug = (name) => {
      const special = {
        "Seoung - su": "seoung-su",
      };
      const raw = special[name] ?? String(name || "");
      return raw
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // replace any non-alphanumeric with hyphen
        .replace(/-+/g, "-")         // collapse multiple hyphens
        .replace(/^-|-$/g, "");      // trim leading/trailing hyphens
    };

    // Case-sensitive image filename overrides
    const regionImageMap = {
      Mapo: "Mapo",
      Gangnam: "Gangnam",
      Jung: "Jung",
      Jongno: "Jongno",
      Dongdaemun: "Dongdaemun",
      Jungnang: "Jungnang",
      Gwangjin: "Gwangjin",
      Seoungdong: "Seoungdong",
      Seoungbuk: "Seoungbuk",
      Dobong: "Dobong",
      Nowon: "Nowon",
      Eunpyeong: "Eunpyeong",
      Sedaemun: "Sedaemun",
      Yangcheon: "Yangcheon",
      Gangseo: "Gangseo",
      Gangbuk: "Gangbuk",
      Guro: "Guro",
      Geumcheon: "Geumcheon",
      // --- newly added mappings ---
      Yeongdeungpo: "Gangbuk",   // show Gangbuk@4x.png when Yeongdeungpo is clicked
      Dongjak: "Dongjak",
      Gawnak: "Gwanak",          // if label is 'Gawnak', use Gawnak@4x.png
      Gwanak: "Gwanak",
      Seocho: "Seocho",
      Songpa: "Songpa",
      Gangdong: "Gangdong",
    };

    const regionKoMap = {
      Seoungdong: '성동구',
      'Seoung - su': '성동구',
      Yongsan: '용산구',
      Mapo: '마포구',
      Gangnam: '강남구',
      Jung: '중구',
      Jongno: '종로구',
      Gwangjin: '광진구',
      Dongdaemun: '동대문구',
      Jungnang: '중랑구',
      Seoungbuk: '성북구',
      Gangbuk: '강북구',
      Dobong: '도봉구',
      Nowon: '노원구',
      Eunpyeong: '은평구',
      Sedaemun: '서대문구',
      Yangcheon: '양천구',
      Gangseo: '강서구',
      Guro: '구로구',
      Geumcheon: '금천구',
      Yeongdeungpo: '영등포구',
      Dongjak: '동작구',
      Gwanak: '관악구',
      Seocho: '서초구',
      Songpa: '송파구',
      Gangdong: '강동구',
    };

    const resolveRegionImageFile = (key) => {
      const base = regionImageMap[key] ?? regionSlug(key);
      // If mapping already includes an extension, return as-is
      if (base.endsWith('.png')) return base;
      // If mapping is like 'Gangseo4x' (already includes 4x), do not append '@4x'
      if (base.endsWith('4x')) return `${base}.png`;
      // Default pattern
      return `${base}@4x.png`;
    };

    const uniqueRegions = Array.from(new Set(shops.map(s => s.region))).filter(Boolean);

    // ---- Custom region display order for Section 2 & Region menu ----
    const REGION_ORDER = ['Seoung - su', 'Gangnam', 'Yongsan', 'Mapo', 'Jung'];
    const orderRank = new Map(REGION_ORDER.map((r, i) => [r, i]));

    // Normalize a region label to a canonical form for comparison only
    const canonForSort = (name) => {
      if (!name) return '';
      let s = String(name)
        .normalize('NFC')
        .replace(/\u00A0/g, ' ')              // NBSP → space
        .replace(/[\u2010-\u2015]/g, '-')     // hyphen/en-dash/em-dash → '-'
        .replace(/\s+/g, ' ')
        .trim();
      const slug = s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const alias = {
        // Seongsu variants → canonical 'Seoung - su'
        'seoung-su': 'Seoung - su',
        'seongsu': 'Seoung - su',
        'seong-su': 'Seoung - su',
        'seongsu-dong': 'Seoung - su',
        'seongsudong': 'Seoung - su',
        'seoungdong': 'Seoung - su',
        'seongdong': 'Seoung - su',
        // Other main districts (lowercase) → proper-cased keys
        'gangnam': 'Gangnam',
        'yongsan': 'Yongsan',
        'mapo': 'Mapo',
        'jongno': 'Jongno',
      };
      return alias[slug] || s;
    };

    const originalIndex = new Map(uniqueRegions.map((r, i) => [r, i]));
    const orderedRegions = [...uniqueRegions].sort((a, b) => {
      const aCanon = canonForSort(a);
      const bCanon = canonForSort(b);
      const ra = orderRank.has(aCanon)
        ? orderRank.get(aCanon)
        : REGION_ORDER.length + (originalIndex.get(a) ?? 9999);
      const rb = orderRank.has(bCanon)
        ? orderRank.get(bCanon)
        : REGION_ORDER.length + (originalIndex.get(b) ?? 9999);
      return ra - rb;
    });

    const sungSuShops = shops.filter((shop) => shop.region === "Seoung - su");
    const yongSanShops = shops.filter((shop) => shop.region === "Yongsan");
    const itaewonShops = shops.filter((shop) => shop.region === "Itaewon");
    const hongdaeShops = shops.filter((shop) => shop.region === "Hongdae");
    const gangnamShops = shops.filter((shop) => shop.region === "Gangnam");
    const myeongdongShops = shops.filter((shop) => shop.region === "Myeongdong");
    const chunkArray = (arr, size) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    };

    const [currentPage, setCurrentPage] = useState(1);

    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const toggleCategoryMenu = () => setIsCategoryOpen(prev => !prev);
    const [isRegionOpen, setIsRegionOpen] = useState(false);
    const toggleRegionMenu = () =>
      setIsRegionOpen(prev => {
        const next = !prev;
        if (next) {
          setMapSrc(DEFAULT_MAP_SRC);
        }
        return next;
      });

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [hoverRegion, setHoverRegion] = useState(null);
    // Category hover: EN → KO
    const [hoverCategory, setHoverCategory] = useState(null);
    const categoryKoMap = {
      // Cafe
      Cafe: '카페',
      cafe: '카페',
      CAFE: '카페',

      // Bakery
      Bakery: '베이커리',
      bakery: '베이커리',
      BAKERY: '베이커리',

      // Restaurant
      Restaurant: '음식점',
      restaurant: '음식점',
      RESTAURANT: '음식점',

      // Bar
      Bar: '주점',
      bar: '주점',
      BAR: '주점',

      // Fancy
      Fancy: '팬시',
      fancy: '팬시',
      FANCY: '팬시',

      // Pub
      Pub: '펍',
      pub: '펍',
      PUB: '펍',

      // Museum
      Museum: '박물관',
      museum: '박물관',
      MUSEUM: '박물관',

      // Interior
      Interior: '인테리어',
      interior: '인테리어',
      INTERIOR: '인테리어',

      // Cosmetics
      Cosmetics: '화장품',
      cosmetics: '화장품',
      COSMETICS: '화장품',

      // Fashion
      Fashion: '패션',
      fashion: '패션',
      FASHION: '패션',

      // Library
      Library: '도서관',
      library: '도서관',
      LIBRARY: '도서관',

      // Flower shop
      'Flower shop': '꽃집',
      'Flower Shop': '꽃집',
      'flower shop': '꽃집',

      // Gallery
      Gallery: '갤러리',
      gallery: '갤러리',
      GALLERY: '갤러리',

      // Shop
      Shop: '샵',
      shop: '샵',
      SHOP: '샵',

      // Etc
      Etc: '기타',
      etc: '기타',
      ETC: '기타',
    };

    // ---- Robust region image resolver (handles case/extension mismatches) ----
    const mapErrorRef = useRef({ key: null, candidates: [], index: 0 });

    const buildRegionCandidates = (key) => {
      // prefer explicit mapping; fall back to raw key
      const baseRaw = regionImageMap[key] ?? key ?? "";
      // different casing variants
      const variants = Array.from(new Set([
        baseRaw,
        String(baseRaw).replace(/\s+/g, ""),
        String(baseRaw).toLowerCase(),
        String(baseRaw).charAt(0).toUpperCase() + String(baseRaw).slice(1).toLowerCase(),
      ].filter(Boolean)));

      const exts = ['@4x.png','@4x.PNG','.png','.PNG','.jpg','.JPG','.jpeg','.JPEG','.webp','.WEBP'];
      const list = [];
      for (const v of variants) {
        for (const e of exts) {
          list.push(withBase(`4x/${v}${e}`));
        }
      }
      return list;
    };

    const setRegionMap = (key) => {
      const candidates = buildRegionCandidates(key);
      mapErrorRef.current = { key, candidates, index: 0 };
      if (candidates.length) {
        setMapSrc(candidates[0]);
      } else {
        setMapSrc(DEFAULT_MAP_SRC);
      }
    };

    // ---- Section 1 (hero) setup ----
    const SECTION2_ID = 'section-2';
    // Filesystem: /Users/junhyeok/Desktop/seoul/public/landing first
    // Served path from public/: `${import.meta.env.BASE_URL}landing first`
    // timing: hold 3s, fade 3s (slow crossfade)
    const HOLD_MS = 3000;
    const FADE_MS = 3000;
    const IDLE_TIMEOUT_MS = 60 * 1000;

    // two-layer crossfade state
    const [heroImages, setHeroImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [nextIndex, setNextIndex] = useState(1);
    const [overlayOpacity, setOverlayOpacity] = useState(0);
    const overlayRef = useRef(null);
    const holdTimeoutRef = useRef(null);
    const fadeTimeoutRef = useRef(null);
    const idxRef = useRef(0);
    const cycleIdRef = useRef(0);
    // Once true, user cannot go back to Section 1 without a refresh
    const lockToSection2Ref = useRef(false);
    // Track if this mount came from a hard refresh
    const isReloadRef = useRef(false);
    // Track if we're currently performing a programmatic smooth scroll
    const isSmoothScrollingRef = useRef(false);
    const idleTimeoutRef = useRef(null);
    const autoScrollTriggeredRef = useRef(false);

// Smooth scroll to Section 2, then enable the lock AFTER arrival
const smoothScrollToSection2 = () => {
  autoScrollTriggeredRef.current = true;
  const el = document.getElementById(SECTION2_ID);
  if (!el) return;
  const targetTop = el.getBoundingClientRect().top + window.scrollY;

  // Begin smooth scroll without locking yet (to avoid snap)
  isSmoothScrollingRef.current = true;
  window.scrollTo({ top: targetTop, behavior: 'smooth' });

  // Watch for arrival
  const onArrive = () => {
    const y = window.scrollY;
    if (Math.abs(y - targetTop) <= 2) {
      window.removeEventListener('scroll', onArrive);
      isSmoothScrollingRef.current = false;
      lockToSection2Ref.current = true; // lock only after we arrive to avoid cutting animation
      scheduleIdleReturn();
    }
  };
  window.addEventListener('scroll', onArrive, { passive: true });

  // Fallback in case no scroll events fire (very short distance)
  setTimeout(() => {
    if (!lockToSection2Ref.current) {
      try { window.removeEventListener('scroll', onArrive); } catch {}
      isSmoothScrollingRef.current = false;
      lockToSection2Ref.current = true;
      scheduleIdleReturn();
    }
  }, 1200);
};

function clearIdleTimer() {
  if (idleTimeoutRef.current) {
    clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = null;
  }
}

function returnToSection1() {
  if (typeof window === 'undefined') return;
  clearIdleTimer();
  lockToSection2Ref.current = false;
  isSmoothScrollingRef.current = true;
  autoScrollTriggeredRef.current = false;

  const onReachTop = () => {
    if (window.scrollY <= 2) {
      window.removeEventListener('scroll', onReachTop);
      isSmoothScrollingRef.current = false;
    }
  };

  window.addEventListener('scroll', onReachTop, { passive: true });
  window.scrollTo({ top: 0, behavior: 'smooth' });

  setTimeout(() => {
    try { window.removeEventListener('scroll', onReachTop); } catch {}
    isSmoothScrollingRef.current = false;
  }, 1200);

  if (window.location.hash === `#${SECTION2_ID}`) {
    const baseUrl = window.location.pathname + window.location.search;
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', baseUrl);
    }
  }
}

function scheduleIdleReturn() {
  if (typeof window === 'undefined') return;
  if (!lockToSection2Ref.current) {
    clearIdleTimer();
    return;
  }
  clearIdleTimer();
  idleTimeoutRef.current = setTimeout(() => {
    if (!lockToSection2Ref.current) return;
    returnToSection1();
  }, IDLE_TIMEOUT_MS);
}

function noteUserActivity(event) {
  if (!lockToSection2Ref.current) {
    if (!autoScrollTriggeredRef.current) {
      if (event && event.type === 'keydown') {
        event.preventDefault();
      }
      smoothScrollToSection2();
    }
    clearIdleTimer();
    return;
  }
  scheduleIdleReturn();
}

    const clearCycleTimers = () => {
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
        holdTimeoutRef.current = null;
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
    };

    // preload helpers
    const preloadImage = (url) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });

    const preloadForFade = (url) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (img.decode) {
            img.decode().then(() => resolve(true)).catch(() => resolve(true));
          } else {
            resolve(true);
          }
        };
        img.onerror = () => resolve(false);
        img.src = url;
      });

    const discoverHeroImages = async () => {
      // Strict ordered sequence: 1..12 under /landing first (try multiple extensions)
      const bases = ['1','2','3','4','5','6','7','8','9','10','11','12'];
      const exts = ['.png', '.PNG', '.jpg', '.jpeg', '.webp', '.JPG', '.JPEG', '.WEBP'];
      const found = [];
      for (const b of bases) {
        let chosen = null;
        for (const ext of exts) {
          const url = `${LANDING_DIR_ENC}/${b}${ext}`;
          // eslint-disable-next-line no-await-in-loop
          const ok = await preloadImage(url);
          if (ok) { chosen = url; break; }
        }
        if (chosen) found.push(chosen);
      }
      return found.length ? found : [DEFAULT_MAP_SRC];
    };

    const startCycle = () => {
      if (heroImages.length < 2) return;
      clearCycleTimers();
      const myCycle = ++cycleIdRef.current;
      const next = (idxRef.current + 1) % heroImages.length;
      const nextUrl = heroImages[next];

      // HOLD phase then fade
      holdTimeoutRef.current = setTimeout(async () => {
        if (cycleIdRef.current !== myCycle) return;

        // Preload next image to avoid pop-in
        await preloadForFade(nextUrl);
        if (cycleIdRef.current !== myCycle) return;

        // Set overlay to the next src exactly when starting the fade
        setOverlayOpacity(0);
        setNextIndex(next);
        requestAnimationFrame(() => {
          const el = overlayRef.current;
          if (el) { void el.offsetWidth; } // force reflow to ensure transition
          requestAnimationFrame(() => setOverlayOpacity(1));
        });

        // Commit after fade completes
        fadeTimeoutRef.current = setTimeout(() => {
          if (cycleIdRef.current !== myCycle) return;
          setCurrentIndex(next);
          idxRef.current = next;
          setOverlayOpacity(0);
          startCycle();
        }, FADE_MS);
      }, HOLD_MS);
    };

    const handleHeroError = (badSrc) => {
      setHeroImages(prev => {
        const filtered = prev.filter(src => src !== badSrc);
        if (!filtered.length) return [DEFAULT_MAP_SRC];
        const cur = Math.min(idxRef.current, filtered.length - 1);
        idxRef.current = cur;
        return filtered;
      });
    };

    // mount: load images and kick off cycle once
    useEffect(() => {
      (async () => {
        const list = await discoverHeroImages();
        setHeroImages(list);
        setCurrentIndex(0);
        idxRef.current = 0;
        setNextIndex(list.length > 1 ? 1 : 0);
        setOverlayOpacity(0);
        // (startCycle will be triggered in effect below)
      })();
      return () => {
        clearCycleTimers();
      };
    }, []);

    // On hard refresh, always start at Section 1 (top) and ignore any hash
    useEffect(() => {
      if (typeof window !== 'undefined' && window.history && 'scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      let isReload = false;
      const nav = performance && performance.getEntriesByType
        ? performance.getEntriesByType('navigation')[0]
        : null;
      if (nav && 'type' in nav) {
        isReload = nav.type === 'reload';
      } else if (performance && performance.navigation) {
        // legacy fallback
        isReload = performance.navigation.type === 1; // 1 === TYPE_RELOAD
      }
      isReloadRef.current = isReload;

      if (isReload) {
        // strip hash so subsequent hash-scroller doesn't run
        if (window.location.hash) {
          const url = window.location.pathname + window.location.search;
          window.history.replaceState(null, '', url);
        }
        // jump to very top synchronously
        window.scrollTo({ top: 0, behavior: 'auto' });
      } else {
        // non-reload: do nothing here; hash (if any) will be handled by the hash scroller below
      }
    }, []);

    // Smooth-scroll to hashed element (e.g., #section-2) on mount and when hash changes
    useEffect(() => {
  const scrollToHash = () => {
    const hash = window.location.hash;
    if (!hash) return;
    if (isReloadRef.current) return; // hard refresh 시에는 섹션1에서 시작
    const id = hash.slice(1);
    const el = document.getElementById(id);
    if (!el) return;

    if (id === SECTION2_ID) {
      // 잠금 선행 금지 → 스무스 후 도착 시 잠금
      smoothScrollToSection2();
    } else {
      // 다른 해시는 기존 동작 유지
      requestAnimationFrame(() => {
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    }
  };

  scrollToHash();
  window.addEventListener('hashchange', scrollToHash);
  return () => window.removeEventListener('hashchange', scrollToHash);
}, [location.hash]);

    // Block wheel-down from Section 1 into Section 2 (enter by image/arrow only)
    useEffect(() => {
      // Block only BEFORE user enters Section 2. Once locked, let wheel behave normally.
      const EPS = 8; // tolerance for layout shifts/subpixel rounding
      const onWheel = (e) => {
        if (lockToSection2Ref.current) return; // already in Section 2 → do not block
        const el = document.getElementById(SECTION2_ID);
        if (!el) return;
        // compute current boundary each event (layout can shift after images/fonts load)
        const section2Top = el.getBoundingClientRect().top + window.scrollY;
        const y = window.scrollY;
        // In Section 1 and scrolling down → block (must use click to enter Section 2)
        if (y < section2Top - EPS && e.deltaY > 0) {
          e.preventDefault();
        }
      };
      window.addEventListener('wheel', onWheel, { passive: false });
      return () => window.removeEventListener('wheel', onWheel);
    }, []);

    // When locked to Section 2, prevent going back above its top (no return to Section 1 without refresh)
    useEffect(() => {
      const EPS = 8; // tolerance for subpixel and layout-shift jitter
      const onScroll = () => {
        // 스무스 스크롤 중에는 간섭 금지 → 끊김 방지
        if (isSmoothScrollingRef.current) return;
        if (!lockToSection2Ref.current) return;
        const el = document.getElementById(SECTION2_ID);
        if (!el) return;
        const section2Top = el.getBoundingClientRect().top + window.scrollY;
        if (window.scrollY < section2Top - EPS) {
          window.scrollTo({ top: section2Top, behavior: 'auto' });
        }
      };
      const onWheel = (e) => {
        // 스무스 중엔 간섭 금지
        if (isSmoothScrollingRef.current) return;
        if (!lockToSection2Ref.current) return;
        const el = document.getElementById(SECTION2_ID);
        if (!el) return;
        const section2Top = el.getBoundingClientRect().top + window.scrollY;
        const y = window.scrollY;
        const projected = y + e.deltaY; // deltaY < 0 => 위로
        if (e.deltaY < 0 && projected < section2Top - EPS) {
          e.preventDefault();
          window.scrollTo({ top: section2Top, behavior: 'auto' });
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('wheel', onWheel, { passive: false });
      return () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('wheel', onWheel);
      };
    }, []);

    // Section 2 idle guard → auto-return to Section 1 after 1 minute of inactivity
    useEffect(() => {
      if (typeof window === 'undefined') return undefined;
      const baseEvents = ['mousemove', 'mousedown', 'touchstart'];
      const keyEvents = [
        { name: 'keydown', options: { capture: true } },
      ];
      const passiveEvents = [
        { name: 'touchmove', options: { passive: true } },
        { name: 'wheel', options: { passive: true } },
      ];
      const onActivity = (event) => {
        noteUserActivity(event);
      };

      baseEvents.forEach(event => window.addEventListener(event, onActivity));
      keyEvents.forEach(({ name, options }) => window.addEventListener(name, onActivity, options));
      passiveEvents.forEach(({ name, options }) => window.addEventListener(name, onActivity, options));

      return () => {
        baseEvents.forEach(event => window.removeEventListener(event, onActivity));
        keyEvents.forEach(({ name, options }) => window.removeEventListener(name, onActivity, options));
        passiveEvents.forEach(({ name, options }) => window.removeEventListener(name, onActivity, options));
        clearIdleTimer();
      };
    }, []);


    // Start hero cycle after images are loaded into state
    useEffect(() => {
      if (heroImages.length > 1) {
        clearCycleTimers();
        // ensure indices are valid and begin from current -> next
        idxRef.current = Math.min(idxRef.current, heroImages.length - 1);
        setCurrentIndex(idxRef.current);
        setNextIndex((idxRef.current + 1) % heroImages.length);
        setOverlayOpacity(0);
        startCycle();
      }
      return () => clearCycleTimers();
    }, [heroImages]);

    // ---- Hydrate filters from URL (e.g., /?category=Cafe&region=Yongsan) ----
    useEffect(() => {
      const params = new URLSearchParams(location.search);
      const cat = params.get("category");
      const region = params.get("region");
      const open = params.get("open"); // which dropdown should be open on arrival

      // Category: allow comma-separated values
      if (cat) {
        const list = cat.split(",").map(s => s.trim()).filter(Boolean);
        setSelectedCategories(list);
      } else {
        setSelectedCategories([]);
      }

      // Region: single value + map sync
      if (region) {
        setSelectedRegion(region);
        setRegionMap(region);
      } else {
        setSelectedRegion(null);
        setMapSrc(DEFAULT_MAP_SRC);
      }

      // Reset page (do not forcibly close dropdowns)
      setCurrentPage(1);

      // Open requested dropdown if specified (e.g., open=category or open=region)
      setIsCategoryOpen(open === 'category');
      setIsRegionOpen(open === 'region');
    }, [location.search]);




    const regionSections = orderedRegions
      .map((r) => ({
        title: r,
        chunks: chunkArray(
          shops.filter(shop => {
            const matchesCategory =
              selectedCategories.length === 0 || selectedCategories.includes(shop.category);
            const matchesRegion = !selectedRegion || selectedRegion === r;
            const matchesSearch =
              searchQuery.trim() === "" || shop.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesRegion && matchesSearch && shop.region === r;
          }),
          5
        )
      }))
      .filter(section => section.chunks.length > 0);

    const regionsPerPage = 5;
    const totalPages = Math.ceil(regionSections.length / regionsPerPage);
    const paginatedRegions = regionSections.slice(
      (currentPage - 1) * regionsPerPage,
      currentPage * regionsPerPage
    );

    const handlePageChange = (pageNumber) => {
      setCurrentPage(pageNumber);
      const el = document.getElementById(SECTION2_ID);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    };

    return (
      <div style={{ letterSpacing: "-0.02em" }}>
        {/* Section 1: Full-screen sequential hero with arrow */}
        <section className="relative h-screen w-full overflow-hidden">
          {/* Section 1 title overlay */}
          {/*
            Title image swaps to Korean on hover.
          */}
          {(() => {
            const [isTitleHover, setIsTitleHover] = useState(false);
            return (
              <img
                src={isTitleHover ? HERO_TITLE_KOR : HERO_TITLE_ENG}
                alt="Seoul Tourism Map for Koreans"
                className="absolute top-8 left-8 z-30 h-auto w-auto max-w-[15%] pointer-events-auto cursor-pointer"
                onMouseEnter={() => setIsTitleHover(true)}
                onMouseLeave={() => setIsTitleHover(false)}
                onClick={() => {
                  smoothScrollToSection2();
                }}
              />
            );
          })()}
          {/* Base image */}
          <img
            src={heroImages[currentIndex]}
            alt="Hero current"
            className="absolute inset-0 w-full h-full object-cover z-0 cursor-pointer"
            onClick={() => {
  smoothScrollToSection2();
}}
            onError={(e) => {
              handleHeroError(e.currentTarget.src);
              e.currentTarget.src = DEFAULT_MAP_SRC;
            }}
          />
          {/* Overlay image (fades in) */}
          <img
            ref={overlayRef}
            src={heroImages[nextIndex]}
            alt="Hero next"
            className="absolute inset-0 w-full h-full object-cover z-10 cursor-pointer"
            style={{ opacity: overlayOpacity, transition: `opacity ${FADE_MS}ms ease-in-out`, willChange: 'opacity' }}
            onClick={() => {
              smoothScrollToSection2();
            }}
            onError={(e) => {
              handleHeroError(e.currentTarget.src);
              e.currentTarget.src = DEFAULT_MAP_SRC;
            }}
          />
          {/* Top gradient (full-width, top-to-bottom black) */}
          <div
            className="absolute inset-x-0 top-0 h-[300px] pointer-events-none bg-gradient-to-b from-black/80 to-transparent z-[15]"
          />
          {/* Bottom gradient (full-width, bottom-to-top black) */}
          <div
            className="absolute inset-x-0 bottom-0 h-[300px] pointer-events-none bg-gradient-to-t from-black/80 to-transparent z-[15]"
          />
          {/* subtle gradient overlay */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
          {/* scroll arrow */}
          <button
            type="button"
            className="absolute left-1/2 -translate-x-1/2 bottom-[82px] z-20 bg-transparent p-0 m-0 text-white transition cursor-pointer"
            onClick={() => {
              smoothScrollToSection2();
            }}
            aria-label="Scroll to content"
            title="Scroll"
          >
            <span
              className="inline-block font-[900] font-suit text-[48px] select-none leading-none hover:opacity-80"
              style={{ transform: 'rotate(90deg)', transformOrigin: '50% 50%' }}
            >
              &gt;
            </span>
          </button>
        </section>

        {/* Section 2: Existing content */}
        <section id={SECTION2_ID} className="mb-20">
            <div className="mx-auto px-[100px]">
                <div className="flex items-center justify-between mt-8">
                  {/* Title image with hover effect */}
                  {(() => {
                    const [imgSrc, setImgSrc] = useState(HERO_LOGO_BLACK_ENG);
                    // Handler for click: same as original div
                    const handleClick = () => {
                      setSelectedCategories([]);
                      setSelectedRegion(null);
                      setSearchQuery("");
                      setCurrentPage(1);
                      setIsCategoryOpen(false);
                      setIsRegionOpen(false);
                      lockToSection2Ref.current = true;
                      scheduleIdleReturn();
                      if (window.location.hash !== '#section-2') {
                        window.location.hash = 'section-2';
                      } else {
                        const el = document.getElementById(SECTION2_ID);
                        if (el) {
                          const top = el.getBoundingClientRect().top + window.scrollY;
                          window.scrollTo({ top, behavior: 'smooth' });
                        }
                      }
                    };
                    return (
                      <img
                        src={imgSrc}
                        alt="Seoul Tourism Map"
                        className="h-auto w-auto max-w-[15%] cursor-pointer"
                        onClick={handleClick}
                        onMouseEnter={() => setImgSrc(HERO_LOGO_BLACK_KOR)}
                        onMouseLeave={() => setImgSrc(HERO_LOGO_BLACK_ENG)}
                        style={{ fontWeight: 700, fontSize: '36px' }}
                      />
                    );
                  })()}
                  <div className="flex items-end gap-2">
                    {isSearchOpen && (
                      <div className="flex flex-col items-start gap-1">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by name"
                          className="w-[250px] px-2 py-1 text-sm border border-zinc-300 rounded-md"
                        />
                        <div className="w-[250px] h-[2px] bg-black" />
                      </div>
                    )}
                    <img
                      src={SEARCH_ICON}
                      alt="Search Icon"
                      className="w-[32px] h-[32px] cursor-pointer hover:opacity-80"
                      onClick={() => setIsSearchOpen(prev => !prev)}
                    />
                  </div>
                </div>
                <div className="flex flex-col text-left gap-2 mt-6 mb-2 text-sm font-medium text-zinc-700 px-1">
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedRegion(null);
                    }}
                    className={`text-left hover:underline text-[16px]${location.pathname === "/" ? " font-bold" : ""}`}
                  >
                    All
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleCategoryMenu}
                      className="flex items-center gap-1 text-left hover:underline text-[16px]"
                      type="button"
                    >
                      Category
                      <span className="text-xs">{isCategoryOpen ? "▾" : "▸"}</span>
                    </button>
                    {selectedCategories.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        {selectedCategories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategories(prev => prev.filter(c => c !== cat))}
                            className="inline-flex items-center gap-2 bg-black text-white rounded-full px-3 py-1 text-xs hover:opacity-80"
                            aria-label={`Remove ${cat}`}
                          >
                            <span>{cat}</span>
                            <span aria-hidden>✕</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {isCategoryOpen && (
  <div className="ml-2 mt-1 mb-6 text-[16px] text-zinc-600 grid grid-cols-8 gap-x-0 gap-y-1">
    <div
      className="w-[200px] h-[52px] flex items-center justify-center rounded-md hover:bg-zinc-100 hover:font-bold cursor-pointer leading-tight text-[16px]"
      onClick={() => setSelectedCategories([])}
    >
      전체
    </div>
    {Array.from(new Set(shops.map(shop => shop.category))).map((category) => (
      <div
        key={category}
        className={`relative w-[200px] h-[52px] flex items-center justify-center rounded-md hover:bg-zinc-100 hover:font-bold cursor-pointer leading-tight text-[16px] ${
          selectedCategories.includes(category) ? "bg-zinc-100 font-bold" : ""
        }`}
        onClick={() =>
          setSelectedCategories(prev => {
            if (prev.includes(category)) {
              return prev.filter(c => c !== category);
            }
            return [...prev, category];
          })
        }
        onMouseEnter={() => setHoverCategory(category)}
        onMouseLeave={() => setHoverCategory(null)}
        aria-label={category}
      >
        {/* English label */}
        <span
          className={`block transition-opacity ${hoverCategory === category ? 'opacity-0' : 'opacity-100'}`}
          style={{ transition: 'opacity 1000ms ease' }}
        >
          {category}
        </span>
        {/* Korean label (overlaid) */}
        <span
          className={`absolute inset-0 flex items-center justify-center transition-opacity ${hoverCategory === category ? 'opacity-100' : 'opacity-0'}`}
          style={{ transition: 'opacity 1000ms ease' }}
        >
          {categoryKoMap[category] ?? category}
        </span>
      </div>
    ))}
  </div>
)}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleRegionMenu}
                      className="flex items-center gap-1 text-left hover:underline text-[16px]"
                      type="button"
                    >
                      Region
                      <span className="text-xs">{isRegionOpen ? "▾" : "▸"}</span>
                    </button>
                    {selectedRegion && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => { setSelectedRegion(null); setMapSrc(DEFAULT_MAP_SRC); }}
                          className="inline-flex items-center gap-2 bg-black text-white rounded-full px-3 py-1 text-xs hover:opacity-80"
                          aria-label={`Remove ${selectedRegion}`}
                        >
                          <span>{selectedRegion}</span>
                          <span aria-hidden>✕</span>
                        </button>
                      </div>
                    )}
                  </div>
                  {isRegionOpen && (
  <div className="ml-2 mt-6 text-[16px] text-zinc-600 flex items-stretch gap-[96px]">
    {/* Left: 60% - Regions grid (5 per row) */}
    <div className="w-3/5">
      <div className="grid grid-cols-5 gap-x-2 gap-y-6">
        <button
          type="button"
          className="w-full h-[52px] flex items-center justify-center rounded-md hover:bg-zinc-100 hover:font-bold leading-tight cursor-pointer text-[16px]"
          onClick={() => {
            setSelectedRegion(null);
            setMapSrc(DEFAULT_MAP_SRC);
          }}
        >
          전체
        </button>
        {orderedRegions.map((r) => (
          <button
            key={r}
            type="button"
            className={`relative w-full h-[52px] flex items-center justify-center rounded-md hover:bg-zinc-100 hover:font-bold leading-tight cursor-pointer text-[16px] ${selectedRegion === r ? 'bg-zinc-100 font-bold' : ''}`}
            onClick={() => {
              setSelectedRegion(r);
              setRegionMap(r);
            }}
            onMouseEnter={() => setHoverRegion(r)}
            onMouseLeave={() => setHoverRegion(null)}
            aria-label={r}
          >
            {/* English label */}
            <span
              className={`block transition-opacity ${hoverRegion === r ? 'opacity-0' : 'opacity-100'}`}
              style={{ transition: 'opacity 1000ms ease' }}
            >
              {r}
            </span>
            {/* Korean label (overlaid) */}
            <span
              className={`absolute inset-0 flex items-center justify-center transition-opacity ${hoverRegion === r ? 'opacity-100' : 'opacity-0'}`}
              style={{ transition: 'opacity 1000ms ease' }}
            >
              {regionKoMap[r] ?? r}
            </span>
          </button>
        ))}
      </div>
    </div>

    {/* Right: 35% - Seoul map PNG */}
    <div className="w-[30%]">
      <div className="rounded-lg p-0 bg-transparent h-full">
        <img
          src={mapSrc}
          alt="Seoul map"
          className="w-full h-full object-contain"
          onError={() => {
            // Try next candidate for the current region; if exhausted, fall back
            const t = mapErrorRef.current;
            if (t && Array.isArray(t.candidates) && t.index + 1 < t.candidates.length) {
              t.index += 1;
              setMapSrc(t.candidates[t.index]);
            } else {
              // ultimate fallbacks
              if (mapSrc !== DEFAULT_MAP_SRC) {
                setMapSrc(DEFAULT_MAP_SRC);
              } else if (mapSrc !== FALLBACK_MAP_SVG) {
                setMapSrc(FALLBACK_MAP_SVG);
              }
            }
          }}
        />
      </div>
    </div>
  </div>
)}
                </div>
                <div className="w-full mt-4 h-px bg-zinc-300" />
                {paginatedRegions.map(({ title, chunks }) => (
                  <div key={title}>
                    <div
                      className="mt-[72px] mb-[72px] text-center text-[24px] font-bold w-fit mx-auto cursor-pointer"
                      onMouseEnter={() => setHoverRegion(title)}
                      onMouseLeave={() => setHoverRegion(null)}
                    >
                      <div className="relative inline-block min-w-[180px]">
                        {/*
                          Regions that swap to Korean on hover
                        */}
                        {(() => {
                          const hoverable = [
                            'Seoungdong','Seoung - su','Yongsan','Mapo','Gangnam','Jung','Jongno','Gwangjin','Dongdaemun','Jungnang','Seoungbuk','Gangbuk','Dobong','Nowon','Eunpyeong','Sedaemun','Yangcheon','Gangseo','Guro','Geumcheon','Yeongdeungpo','Dongjak','Gwanak','Seocho','Songpa','Gangdong'
                          ];
                          const koMap = {
                            'Seoungdong':'성동구','Seoung - su':'성동구','Yongsan':'용산구','Mapo':'마포구','Gangnam':'강남구','Jung':'중구','Jongno':'종로구','Gwangjin':'광진구','Dongdaemun':'동대문구','Jungnang':'중랑구','Seoungbuk':'성북구','Gangbuk':'강북구','Dobong':'도봉구','Nowon':'노원구','Eunpyeong':'은평구','Sedaemun':'서대문구','Yangcheon':'양천구','Gangseo':'강서구','Guro':'구로구','Geumcheon':'금천구','Yeongdeungpo':'영등포구','Dongjak':'동작구','Gwanak':'관악구','Seocho':'서초구','Songpa':'송파구','Gangdong':'강동구'
                          };
                          const shouldSwap = hoverable.includes(title);
                          const showKo = shouldSwap && hoverRegion === title;
                          return (
                            <>
                              {/* English label */}
                              <span
                                className={`block transition-opacity duration-150 pointer-events-none ${showKo ? 'opacity-0' : 'opacity-100'}`}
                                style={{ transition: 'opacity 1000ms ease, transform 400ms ease, filter 400ms ease' }}
                              >
                                {title}
                              </span>
                              {/* Korean label */}
                              {shouldSwap && (
                                <span
                                  className={`absolute inset-0 flex items-center justify-center transition-opacity duration-150 pointer-events-none ${showKo ? 'opacity-100' : 'opacity-0'}`}
                                  style={{ transition: 'opacity 1000ms ease, transform 400ms ease, filter 400ms ease' }}
                                >
                                  {koMap[title]}
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    {chunks.map((group, idx) => (
                      <div key={idx} className="grid grid-cols-5 gap-x-[40px] w-full mx-auto mb-6">
                        {group.map((shop) => (
                          <div className="text-center rounded-xl flex flex-col justify-center" key={shop.name}>
                            <Link to={`/shops/${shop.name}`} className="flex flex-col justify-center">
                              <div className="flex justify-between w-full px-4 leading-[0.75rem] -space-y-1">
                                <span className="text-left leading-[0.75rem]">{shop.name}</span>
                                <span className="text-right text-zinc-500 leading-[0.75rem] -mt-1">{shop.category}</span>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ))}
                    <div className="w-full border-t border-dashed border-zinc-300 my-[72px]" />
                  </div>
                ))}
                <div className="flex justify-center gap-2 my-8">
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        className={`px-4 py-2 rounded border ${
                          currentPage === pageNum ? "bg-black text-white" : "bg-white text-black border-zinc-300"
                        }`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
            </div>
        </section>
        </div>
    );
};

export default LandingPage;
