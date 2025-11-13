import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { shops } from "../../shopsData.js";
import { useMemo, memo, useEffect, useState, useCallback, useRef } from "react";

const withBase = (path = "") => {
    const base = import.meta.env.BASE_URL || "/";
    return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
};

const DEFAULT_MAP_SRC = withBase("Etc/all@4x.png");
const FALLBACK_MAP_SVG = withBase("svg/all.svg");
const DEFAULT_SHOP_IMAGE = withBase("Etc/noimage@4x.png");

const ShopDetailPageComponent = () => {
    const { shopName } = useParams();
    const decodedShopName = decodeURIComponent(shopName);
    const location = useLocation();
    const navigate = useNavigate();
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isRegionOpen, setIsRegionOpen] = useState(false);
    const IDLE_TIMEOUT_MS = 60 * 1000;
    const idleTimeoutRef = useRef(null);
    const hasReturnedRef = useRef(false);

    const clearIdleTimer = useCallback(() => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = null;
      }
    }, []);

    const returnToLandingSection1 = useCallback(() => {
      if (hasReturnedRef.current) return;
      hasReturnedRef.current = true;
      clearIdleTimer();
      try { sessionStorage.removeItem('jumpToSection2'); } catch {}
      navigate('/', { replace: true });
    }, [clearIdleTimer, navigate]);

    const scheduleIdleReturn = useCallback(() => {
      if (typeof window === 'undefined') return;
      if (hasReturnedRef.current) {
        clearIdleTimer();
        return;
      }
      clearIdleTimer();
      idleTimeoutRef.current = setTimeout(() => {
        if (hasReturnedRef.current) return;
        returnToLandingSection1();
      }, IDLE_TIMEOUT_MS);
    }, [clearIdleTimer, returnToLandingSection1]);

    const noteUserActivity = useCallback(() => {
      if (hasReturnedRef.current) {
        clearIdleTimer();
        return;
      }
      scheduleIdleReturn();
    }, [clearIdleTimer, scheduleIdleReturn]);

    // Helper: jump to Landing with filters applied and Section 2 focused
    const goToLandingWithFilters = useCallback(({ categories = [], region = null } = {}) => {
      const params = new URLSearchParams();
      if (categories.length) {
        params.set('category', categories.join(','));
      }
      if (region) {
        params.set('region', region);
      }
      // Encode which dropdown should be open on Landing
      if (categories.length && !region) params.set('open', 'category');
      if (region && !categories.length) params.set('open', 'region');
      // If both provided, default to opening category
      if (categories.length && region) params.set('open', 'category');

      try { sessionStorage.setItem('jumpToSection2', '1'); } catch {}
      navigate({ pathname: '/', search: `?${params.toString()}`, hash: '#section-2' });
    }, [navigate]);

    // Category hover: EN ↔ KO
    const [hoverCategory, setHoverCategory] = useState(null);
    const categoryKoMap = {
      Cafe: '카페', cafe: '카페', CAFE: '카페',
      Bakery: '베이커리', bakery: '베이커리', BAKERY: '베이커리',
      Restaurant: '음식점', restaurant: '음식점', RESTAURANT: '음식점',
      Bar: '주점', bar: '주점', BAR: '주점',
      Fancy: '팬시', fancy: '팬시', FANCY: '팬시',
      Pub: '펍', pub: '펍', PUB: '펍',
      Museum: '박물관', museum: '박물관', MUSEUM: '박물관',
      Interior: '인테리어', interior: '인테리어', INTERIOR: '인테리어',
      Cosmetics: '화장품', cosmetics: '화장품', COSMETICS: '화장품',
      Fashion: '패션', fashion: '패션', FASHION: '패션',
      Library: '도서관', library: '도서관', LIBRARY: '도서관',
      'Flower shop': '꽃집', 'Flower Shop': '꽃집', 'flower shop': '꽃집',
      Gallery: '갤러리', gallery: '갤러리', GALLERY: '갤러리',
      Shop: '샵', shop: '샵', SHOP: '샵',
      Etc: '기타', etc: '기타', ETC: '기타',
    };

    // Region hover: EN ↔ KO
    const [hoverRegion, setHoverRegion] = useState(null);
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

    // Case-sensitive image filename overrides (same as Landing)
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
      Yeongdeungpo: "Gangbuk", // NOTE: 유지(임시 매핑이 의도라면)
      Dongjak: "Dongjak",
      Gawnak: "Gwanak",
      Gwanak: "Gwanak",
      Seocho: "Seocho",
      Songpa: "Songpa",
      Gangdong: "Gangdong",
    };

    // Robust region image resolver (handles case/extension mismatches)
    const mapErrorRef = useRef({ key: null, candidates: [], index: 0 });

    const buildRegionCandidates = (key) => {
      const baseRaw = regionImageMap[key] ?? key ?? "";
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

    // ==== Landing page menu parity: states & helpers ====
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [mapSrc, setMapSrc] = useState(() => DEFAULT_MAP_SRC);

    const categories = useMemo(() => Array.from(new Set(shops.map(s => s.category))), []);
    const uniqueRegions = useMemo(() => Array.from(new Set(shops.map(s => s.region))).filter(Boolean), []);

    const regionSlug = (name) => {
      const special = {
        'Seoung - su': 'seoung-su',
        'Seoungdong': 'seoung-su',
      };
      const raw = special[name] ?? String(name || '');
      return raw
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    };

    useEffect(() => {
      if (typeof window !== 'undefined') {
        scheduleIdleReturn();
        const activeEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
        const passiveEvents = [
          { name: 'touchmove', options: { passive: true } },
          { name: 'wheel', options: { passive: true } },
        ];
        activeEvents.forEach((evt) => window.addEventListener(evt, noteUserActivity));
        passiveEvents.forEach(({ name, options }) => window.addEventListener(name, noteUserActivity, options));
        return () => {
          activeEvents.forEach((evt) => window.removeEventListener(evt, noteUserActivity));
          passiveEvents.forEach(({ name, options }) => window.removeEventListener(name, noteUserActivity, options));
          clearIdleTimer();
        };
      }
      return undefined;
    }, [scheduleIdleReturn, noteUserActivity, clearIdleTimer]);

    useEffect(() => {
      if (isRegionOpen) {
        setMapSrc(DEFAULT_MAP_SRC);
      }
    }, [isRegionOpen, DEFAULT_MAP_SRC]);

    const shop = shops.find(
        (s) => s.name.toLowerCase() === decodedShopName.toLowerCase()
    );

    if (!shop) {
        return (
            <div className="text-center text-red-600 mt-10 font-bold">
                상점 정보를 찾을 수 없습니다: "{decodedShopName}"
            </div>
        );
    }

    const regionShopList = shops.filter((s) => s.region === shop.region);
    const currentIndex = regionShopList.findIndex(
        (s) => s.name.toLowerCase() === shop.name.toLowerCase()
    );

    const prevShop = currentIndex > 0 ? regionShopList[currentIndex - 1] : null;
    const nextShop =
        currentIndex >= 0 && currentIndex < regionShopList.length - 1
            ? regionShopList[currentIndex + 1]
            : null;

    return (
        <div style={{ letterSpacing: "-0.02em" }}>
            <section className="mb-20">
                <div className="mx-auto px-[100px] w-full">
                    <HeaderLogo />
                    <div className="flex flex-col items-start mt-4 mb-2 text-[16px] font-medium text-zinc-700 px-1 gap-2">
                        <button
                            type="button"
                            onClick={() => { setSelectedCategories([]); setSelectedRegion(null); }}
                            className={`hover:underline${location.pathname === '/' ? ' font-bold' : ''}`}
                        >
                            All
                        </button>

                        {/* Category label + chips */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsCategoryOpen((prev) => !prev)}
                                className="flex items-center gap-1 text-left hover:underline"
                                type="button"
                            >
                                Category
                                <span className="text-xs">{isCategoryOpen ? '▾' : '▸'}</span>
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

                        {/* Category dropdown directly under Category label */}
                        {isCategoryOpen && (
                          <div className="ml-2 mt-1 mb-6 text-[16px] text-zinc-600 grid grid-cols-8 gap-x-0 gap-y-1">
                            <div
                              className="w-[200px] h-[52px] flex items-center justify-center rounded-md hover:bg-zinc-100 hover:font-bold cursor-pointer leading-tight"
                              onClick={() => setSelectedCategories([])}
                            >
                              전체
                            </div>
                            {categories.map((category) => (
                              <div
                                key={category}
                                className={`relative w-[200px] h-[52px] flex items-center justify-center rounded-md hover:bg-zinc-100 hover:font-bold cursor-pointer leading-tight ${selectedCategories.includes(category) ? "bg-zinc-100 font-bold" : ""}`}
                                onClick={() => goToLandingWithFilters({ categories: [category] })}
                                onMouseEnter={() => setHoverCategory(category)}
                                onMouseLeave={() => setHoverCategory(null)}
                                aria-label={category}
                              >
                                <span
                                  className={`block transition-opacity ${hoverCategory === category ? 'opacity-0' : 'opacity-100'}`}
                                  style={{ transition: 'opacity 1000ms ease' }}
                                >
                                  {category}
                                </span>
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

                        {/* Region label + chip */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsRegionOpen((prev) => !prev)}
                                className="flex items-center gap-1 text-left hover:underline"
                                type="button"
                            >
                                Region
                                <span className="text-xs">{isRegionOpen ? '▾' : '▸'}</span>
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

                        {/* Region dropdown: 6:4 (left list, right map) */}
                        {isRegionOpen && (
                          <div className="ml-2 mt-1 text-[16px] text-zinc-600 flex items-stretch gap-[52px]">
                            <div className="w-3/5">
                              <div className="grid grid-cols-5 gap-x-2 gap-y-4">
                                <button
                                  type="button"
                                  className="w-full h-[52px] flex items-center justify-center rounded-md hover:bg-zinc-100 hover:font-bold leading-tight cursor-pointer"
                                  onClick={() => { setSelectedRegion(null); setMapSrc(DEFAULT_MAP_SRC); }}
                                >
                                  전체
                                </button>
                                {uniqueRegions.map((r) => (
                                  <button
                                    key={r}
                                    type="button"
                                    className={`relative w-full h-[52px] flex items-center justify-center rounded-md hover:bg-zinc-100 hover:font-bold leading-tight cursor-pointer ${selectedRegion === r ? 'bg-zinc-100 font-bold' : ''}`}
                                    onClick={() => goToLandingWithFilters({ region: r })}
                                    onMouseEnter={() => setHoverRegion(r)}
                                    onMouseLeave={() => setHoverRegion(null)}
                                    aria-label={r}
                                  >
                                    <span
                                      className={`block transition-opacity ${hoverRegion === r ? 'opacity-0' : 'opacity-100'}`}
                                      style={{ transition: 'opacity 1000ms ease' }}
                                    >
                                      {r}
                                    </span>
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
                            <div className="w-[35%]">
                              <div className="rounded-lg p-0 bg-transparent h-full">
                                <img
                                  src={mapSrc}
                                  alt="Seoul map"
                                  className="w-full h-full object-contain"
                                  onError={() => {
                                    const t = mapErrorRef.current;
                                    if (t && Array.isArray(t.candidates) && t.index + 1 < t.candidates.length) {
                                      t.index += 1;
                                      setMapSrc(t.candidates[t.index]);
                                    } else {
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
                </div>
                <div className="mx-auto px-[100px] w-full text-left mt-6">
                    <div className="flex items-center justify-between mb-6">
                        {prevShop ? (
                            <Link to={`/shops/${encodeURIComponent(prevShop.name)}`} replace={false}>
                                <span className="text-xl font-bold hover:underline">&lt;</span>
                            </Link>
                        ) : (
                            <span className="text-xl text-transparent">&lt;</span>
                        )}
                        {nextShop ? (
                            <Link to={`/shops/${encodeURIComponent(nextShop.name)}`} replace={false}>
                                <span className="text-xl font-bold hover:underline">&gt;</span>
                            </Link>
                        ) : (
                            <span className="text-xl text-transparent">&gt;</span>
                        )}
                    </div>
                </div>

                <div className="mx-auto flex gap-10 px-[100px] w-full">
                    <div style={{ flex: 2 }} className="mt-6">
                        <div className="flex flex-col gap-6 text-zinc-700 w-full">
                            <div>
                                <h4 className="font-bold">Region</h4>
                                <button
                                  type="button"
                                  className="text-left text-xl leading-[40px] underline decoration-dotted underline-offset-4 hover:decoration-solid hover:text-black cursor-pointer"
                                  title="해당 지역으로 필터링된 랜딩 페이지로 이동"
                                  onClick={() => goToLandingWithFilters({ region: shop.region })}
                                >
                                  {shop.region}
                                </button>
                            </div>
                            <div>
                                <h4 className="font-bold">Name</h4>
                                <p className="text-xl leading-[40px]">{shop.name}</p>
                            </div>
                            <div>
                                <h4 className="font-bold">Category</h4>
                                <button
                                  type="button"
                                  className="text-left text-xl leading-[40px] underline decoration-dotted underline-offset-4 hover:decoration-solid hover:text-black cursor-pointer"
                                  title="해당 카테고리로 필터링된 랜딩 페이지로 이동"
                                  onClick={() => goToLandingWithFilters({ categories: [shop.category] })}
                                >
                                  {shop.category}
                                </button>
                            </div>
                            <div>
                                <h4 className="font-bold">Address</h4>
                                <p className="text-xl leading-[40px]">{shop.lotAddress}</p>
                            </div>
                            <div>
                                <h4 className="font-bold">Road Name Address</h4>
                                <p className="text-xl leading-[40px]">{shop.roadAddress}</p>
                            </div>
                            <div>
                                <h4 className="font-bold">Postal Code</h4>
                                <p className="text-xl leading-[40px]">{shop.postalCode}</p>
                            </div>
                            <div>
                                <h4 className="font-bold">Number</h4>
                                <p className="text-xl leading-[40px]">{shop.callNumber}</p>
                            </div>
                        </div>
                    </div>
                    <div style={{ flex: 8 }}>
                        <ShopImageToggle shop={shop} />
                    </div>
                </div>
            </section>
        </div>
    );
};

const ShopDetailPage = () => {
    const { shopName } = useParams();
    return <ShopDetailPageComponent key={shopName} />;
};

export default ShopDetailPage;

// Header logo component (hover swap EN ↔ KO, click → Section 2 on Landing)
function HeaderLogo() {
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState("/4x/black eng@4x.png");

  const handleClick = () => {
    try { sessionStorage.setItem('jumpToSection2', '1'); } catch {}
    navigate({ pathname: '/', hash: '#section-2' });
  };

  return (
    <img
      src={imgSrc}
      alt="Seoul Tourism Map"
      className="h-auto w-auto max-w-[15%] cursor-pointer mt-8 block"
      onClick={handleClick}
      onMouseEnter={() => setImgSrc("/4x/black kor@4x.png")}
      onMouseLeave={() => setImgSrc("/4x/black eng@4x.png")}
    />
  );
}

// Image toggle component

function ShopImageToggle({ shop }) {
  const [imageIndex, setImageIndex] = useState(1);
  const [src, setSrc] = useState("");
  const tryRef = useRef({ list: [], i: 0 });

  // 이름 정규화 유틸 (전각 공백 → 일반 공백, 앞뒤 공백 제거, NFC/NFD 모두 대비)
  const normalizeName = useCallback((s) => {
    if (!s) return { base: "" };
    const base = String(s).replace(/\u3000/g, " ").trim();
    return {
      nfc: base.normalize("NFC"),
      nfd: base.normalize("NFD"),
      noSpace: base.replace(/\s+/g, ""),
      nfcNoSpace: base.normalize("NFC").replace(/\s+/g, ""),
      nfdNoSpace: base.normalize("NFD").replace(/\s+/g, ""),
    };
  }, []);

  // 주어진 이름과 인덱스로 시도할 후보 경로들을 생성 (대소문자, 슈퍼스크립트 등 다양한 변형 지원)
  const buildCandidates = useCallback((name, idx) => {
    const v = normalizeName(name);

    // Base name candidates from different unicode/space normalizations
    const baseList = Array.from(new Set([
      v.nfc, v.nfd, v.noSpace, v.nfcNoSpace, v.nfdNoSpace,
    ].filter(Boolean)));

    // Expand a single string into many case/typographic variants
    const expand = (s) => {
      if (!s) return [];
      const words = s.split(/\s+/);
      const title = words
        .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
        .join(" ");
      const swap = s.replace(/[A-Za-z]/g, (c) => (c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase()));

      // Superscript ↔ digit variants
      const supToDigit = s.replace(/[¹²³]/g, (m) => ({ '¹': '1', '²': '2', '³': '3' }[m]));
      const digitToSup = s
        .replace(/1/g, '¹')
        .replace(/2/g, '²')
        .replace(/3/g, '³');
      const removeSup = s.replace(/[¹²³]/g, '');

      // Special brand styling: "PhoSome" ↔ "Pho²Some" (case-insensitive)
      const pho2some = s.replace(/pho\s*some/i, (m) => {
        const isUpperP = /P/.test(m[0]);
        const isUpperS = /S/.test(m.replace(/pho\s*/i, '')[0] || '');
        const P = isUpperP ? 'P' : 'p';
        const S = isUpperS ? 'S' : 's';
        return `${P}ho²${S}ome`;
      });

      return [
        s,
        s.toLowerCase(),
        s.toUpperCase(),
        title,
        swap,
        supToDigit,
        digitToSup,
        removeSup,
        pho2some,
      ];
    };

    // Collect all expanded base variants
    const bases = new Set();
    for (const b of baseList) {
      for (const x of expand(b)) {
        if (x) bases.add(x);
      }
    }

    // Build candidate file paths for many extensions and both encoded/unencoded names
    const exts = ['.png', '.PNG', '.jpg', '.JPG', '.jpeg', '.JPEG', '.webp', '.WEBP'];
    const list = [];
    for (const b of bases) {
      const raw = `shopImage/${b}${idx}`;
      const enc = `shopImage/${encodeURIComponent(b)}${idx}`;
      for (const e of exts) {
        list.push(withBase(raw + e));
        list.push(withBase(enc + e));
      }
    }
    return list;
  }, [normalizeName]);

  // 상점 변경 시 1번 이미지 후보부터 재시도 시작
  useEffect(() => {
    setImageIndex(1);
    const candidates = buildCandidates(shop.name, 1);
    tryRef.current = { list: candidates, i: 0 };
    setSrc(candidates[0] || DEFAULT_SHOP_IMAGE);
  }, [shop.name, buildCandidates]);

  // 호버 시 1↔2 전환 + 해당 인덱스 후보들로 교체
  const applyIndex = useCallback((idx) => {
    setImageIndex(idx);
    const candidates = buildCandidates(shop.name, idx);
    tryRef.current = { list: candidates, i: 0 };
    setSrc(candidates[0] || DEFAULT_SHOP_IMAGE);
  }, [shop.name, buildCandidates]);

  const handleMouseEnter = () => applyIndex(imageIndex === 1 ? 2 : 1);
  const handleMouseLeave = () => applyIndex(imageIndex === 1 ? 2 : 1);

  // 로드 실패 시 다음 후보로 넘어가며, 모두 실패하면 noimage로 대체
  const handleError = () => {
    const t = tryRef.current;
    if (t && t.i + 1 < t.list.length) {
      t.i += 1;
      setSrc(t.list[t.i]);
    } else {
      if (src !== DEFAULT_SHOP_IMAGE) setSrc(DEFAULT_SHOP_IMAGE);
      // 콘솔에서 어떤 후보들을 시도했는지 확인 가능
      console.warn('[ShopImageToggle] No match for', shop.name, t?.list);
    }
  };

  return (
    <div className="mt-6 text-left">
      <img
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        src={src}
        onError={handleError}
        alt={`${shop.name} Image${imageIndex}`}
        className="w-[1920px] h-[974px] object-cover"
      />
    </div>
  );
}
