export interface ICoinShort {
    id: string;
    symbol: string;
    name: string;
}
export interface ICoinLong {
    id: string;
    symbol: string;
    name: string;
    description: string;
    image: {
        small: string;
    }
    market_data: {
        current_price: {
            usd: number,
            eur: number,
            ils: number,
        },
        market_cap: {
            usd: number,
            eur: number,
            ils: number,    
        }
    }
}