import { memo, useState } from "react";

interface Product {
    image: string;
    name: string;
    category: string;
    icon?: string;
    url?: string;
}

interface ProductCardProps {
    product: Product;
    isSelected?: boolean;
    onClick?: () => void;
    index: number;
}

// Color map for category types
const getCategoryColor = (category: string) => {
    if (category.includes("Turbo")) return { bg: "from-cyan-500/20 to-cyan-900/10", badge: "text-cyan-400" };
    if (category.includes("Latest")) return { bg: "from-indigo-500/20 to-indigo-900/10", badge: "text-indigo-400" };
    if (category.includes("DeepHub")) return { bg: "from-emerald-500/20 to-emerald-900/10", badge: "text-emerald-400" };
    return { bg: "from-white/10 to-transparent", badge: "text-white/50" };
};

const ProductCard = memo(({ product }: Omit<ProductCardProps, "isSelected" | "onClick">) => {
    const colors = getCategoryColor(product.category);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    // Google Favicon API — reliable, always resolves
    const logoUrl = product.url
        ? `https://www.google.com/s2/favicons?domain=${new URL(product.url).hostname}&sz=64`
        : null;

    return (
        <div
            className="relative flex-shrink-0 w-48 h-52 rounded-xl overflow-hidden pointer-events-none"
            style={{
                background: "linear-gradient(145deg, hsl(220 20% 10%) 0%, hsl(220 20% 6%) 100%)",
                border: "1px solid hsl(220 15% 18%)",
                boxShadow: "0 8px 32px hsl(0 0% 0% / 0.4)",
            }}
        >
            {/* Icon tile */}
            <div className={`relative w-full h-32 flex items-center justify-center bg-gradient-to-br ${colors.bg}`}>
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-sm select-none overflow-hidden">
                    {/* Emoji fallback — shown when no URL or logo failed */}
                    {(!logoUrl || error) && (
                        <span className="text-4xl">{product.icon || "🤖"}</span>
                    )}
                    {/* Real logo from Google Favicon API */}
                    {logoUrl && !error && (
                        <img
                            src={logoUrl}
                            alt={product.name}
                            loading="lazy"
                            width={48}
                            height={48}
                            className={`w-12 h-12 object-contain ${loaded ? "block" : "hidden"}`}
                            onLoad={() => setLoaded(true)}
                            onError={() => setError(true)}
                        />
                    )}
                </div>
            </div>

            {/* Name + Category */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/95 to-transparent">
                <h3 className="font-display text-xs font-bold tracking-wide text-foreground">
                    {product.name}
                </h3>
                <p className={`text-[10px] mt-0.5 truncate font-mono ${colors.badge}`}>{product.category}</p>
            </div>
        </div>
    );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;



