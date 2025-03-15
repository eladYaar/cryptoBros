import { ICoinLong, ICoinShort } from "../interfaces/ICoin";

export default async function fetchData(url: string): Promise<ICoinShort[] | ICoinLong> {
    const coinGeckoAPIKey = "CG-v2oSfCSuHJMbKSjaZ6dJr6hn";
    const optionsForFetch = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'x-cg-demo-api-key': coinGeckoAPIKey,
        }
    }
    try {
        const response = await fetch(url, optionsForFetch);
        if (!response.ok) {
            throw new Error('Failed to retrieve data from the API');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error", error.message);
        alert("Oops! something went wrong...");
    }
}