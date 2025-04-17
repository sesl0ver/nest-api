export interface steamGame {
    app_id: number;
    fullgame?: number;
    title: string;
    short_description: string;
    detailed_description?: string | null;
    about_the_game?: string | null;
    capsule_image: string;
    header_image: string;
    release_date: string;
    developers: string[];
    publishers: string[];
    genres: string[];
    screenshots?: string[] | null;
    screenshots_full?: string[] | null;
    movies?: string[] | null;
    movies_full?: string[] | null;
    create_date?: string;
    price?: price | null;
}

export interface priceOverview {
    success: boolean;
    data: price | null
}

export interface price {
    id: string;
    lowPrice: number; // 역대 최저가
    lowCut: number; // 역대 할인율
    currentPrice: number; // 현재 가격
    regularPrice: number; // 원래 가격
    cut: number; // 현재 할인율
}