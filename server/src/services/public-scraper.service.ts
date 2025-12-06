import axios from 'axios';
import * as cheerio from 'cheerio';

export class PublicScraperService {

    /**
     * Fallback for YouTube using basic HTML scraping (or YouTube API if configured later).
     * Currently implements a simple meta tag extractor.
     */
    static async scrapeYouTube(url: string) {
        try {
            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const $ = cheerio.load(data);

            return {
                title: $('meta[property="og:title"]').attr('content') || $('title').text(),
                description: $('meta[property="og:description"]').attr('content'),
                image: $('meta[property="og:image"]').attr('content'),
                views: $('meta[itemprop="interactionCount"]').attr('content') || '0',
            };
        } catch (error) {
            console.error('YouTube Scrape Error:', error);
            throw new Error('Failed to scrape YouTube');
        }
    }
}
