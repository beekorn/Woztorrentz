import { getApiUrl } from '../config/api';

interface TorrentResult {
    name: string;
    size: string;
    date: string;
    seeders: string;
    leechers: string;
    magnet: string;
    url: string;

}

interface TorrentSearchResponse {
    data: TorrentResult[];
    total: number;
    time: string;
}

interface TorrentApiResponse {
    success: boolean;
    data?: TorrentSearchResponse;
    error?: string;
}

export class TorrentApiService {
    private static get BASE_URL(): string {
        return `${getApiUrl('torrent')}/api/v1`;
    }

    // Working sites based on testing (updated regularly)
    private static readonly WORKING_SITES = [
        'piratebay',
        'kickass',
        'limetorrents',

    ];

    // Blocked sites (removed - not needed)
    private static readonly BLOCKED_SITES: string[] = [];

    // Sites with issues (removed - not needed)
    private static readonly PROBLEMATIC_SITES: string[] = [];

    static async searchTorrents(query: string, site: string, limit: number = 50): Promise<TorrentApiResponse> {
        try {
            const url = `${this.BASE_URL}/search?query=${encodeURIComponent(query)}&site=${site}&limit=${limit}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Torrent search error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    static async getTrendingTorrents(site: string = 'piratebay'): Promise<TorrentApiResponse> {
        try {
            const params = new URLSearchParams({
                site: site
            });

            const response = await fetch(`${this.BASE_URL}/trending?${params}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Trending torrents error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    static async getRecentTorrents(site: string = 'piratebay'): Promise<TorrentApiResponse> {
        try {
            const params = new URLSearchParams({
                site: site
            });

            const response = await fetch(`${this.BASE_URL}/recent?${params}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Recent torrents error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    static async getSupportedSites(): Promise<string[]> {
        try {
            const response = await fetch(`${this.BASE_URL}/sites`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.supported_sites || [];
        } catch (error) {
            console.error('Get sites error:', error);
            return [];
        }
    }

    static getWorkingSites(): string[] {
        return [...this.WORKING_SITES];
    }

    static getBlockedSites(): string[] {
        return [...this.BLOCKED_SITES];
    }

    static getProblematicSites(): string[] {
        return [...this.PROBLEMATIC_SITES];
    }

    static getBestSite(): string {
        return this.WORKING_SITES[0] || 'piratebay';
    }

    static async getTop100Categories(): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const response = await fetch(`${this.BASE_URL}/top100/categories`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Top100 categories error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    static async getTop100Movies(page: number = 1, limit: number = 100): Promise<TorrentApiResponse> {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });

            const response = await fetch(`${this.BASE_URL}/top100/movies?${params}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Top100 movies error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    static async getTop100ByCategory(category: string, page: number = 1, limit: number = 100): Promise<TorrentApiResponse> {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });

            const response = await fetch(`${this.BASE_URL}/top100/category/${category}?${params}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Top100 category error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    static async searchWithFallback(query: string, preferredSite?: string): Promise<TorrentApiResponse> {
        const sitesToTry = preferredSite
            ? [preferredSite, ...this.WORKING_SITES.filter(s => s !== preferredSite)]
            : this.WORKING_SITES;

        for (const site of sitesToTry) {
            try {
                const result = await this.searchTorrents(query, site);
                if (result.success && result.data && result.data.data.length > 0) {
                    return result;
                }
            } catch (error) {
                console.log(`Site ${site} failed, trying next...`);
                continue;
            }
        }

        return {
            success: false,
            error: 'No working sites found for this search'
        };
    }

    static formatFileSize(size: string): string {
        // Handle various size formats and normalize them
        if (!size || size === 'N/A') return 'Unknown';

        // If already formatted, return as is
        if (size.match(/^\d+(\.\d+)?\s*(B|KB|MB|GB|TB)$/i)) {
            return size;
        }

        // Try to parse numeric size (assuming bytes)
        const numericSize = parseFloat(size);
        if (isNaN(numericSize)) return size;

        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let unitIndex = 0;
        let convertedSize = numericSize;

        while (convertedSize >= 1024 && unitIndex < units.length - 1) {
            convertedSize /= 1024;
            unitIndex++;
        }

        return `${convertedSize.toFixed(1)} ${units[unitIndex]}`;
    }

    static copyMagnetLink(magnet: string): void {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(magnet).then(() => {
                console.log('Magnet link copied to clipboard');
            }).catch(err => {
                console.error('Failed to copy magnet link:', err);
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = magnet;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }
}

export type { TorrentResult, TorrentSearchResponse, TorrentApiResponse };