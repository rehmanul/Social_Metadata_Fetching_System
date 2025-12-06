import express from 'express';
import { BrightDataService } from './services/brightdata.service';
import { PublicScraperService } from './services/public-scraper.service';

const router = express.Router();

// TikTok Fetch Endpoint
router.post('/fetch/tiktok', async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required' });

    try {
        console.log(`[TikTok] Triggering for @${username}`);
        const snapshotId = await BrightDataService.triggerCollection(username);

        // Poll for results (Max 60 seconds)
        let attempts = 0;
        while (attempts < 20) { // 20 * 3s = 60s
            await new Promise(r => setTimeout(r, 3000));
            const status = await BrightDataService.pollStatus(snapshotId);

            if (status.status === 'ready') {
                const data = await BrightDataService.getData(snapshotId);
                return res.json({ success: true, data });
            }
            if (status.status === 'failed') {
                throw new Error('Bright Data collection failed');
            }
            attempts++;
        }

        res.status(408).json({ error: 'Timeout waiting for data', snapshotId });
    } catch (error: any) {
        console.error('[TikTok] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// YouTube Endpoint (Fallback)
router.post('/fetch/youtube', async (req, res) => {
    const { url } = req.body;
    try {
        const data = await PublicScraperService.scrapeYouTube(url);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
