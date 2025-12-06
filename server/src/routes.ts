import express from 'express';
import { BrightDataService } from './services/brightdata.service';
import { PublicScraperService } from './services/public-scraper.service';
import { DataService } from './services/data.service';

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

                // Save to persistent storage
                const saved = DataService.save('tiktok', username, data);

                return res.json({ success: true, data, recordId: saved.id });
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

        // Extract username from URL for storage
        const username = url.includes('@') ? url.split('@')[1]?.split('/')[0] : 'unknown';

        // Save to persistent storage
        const saved = DataService.save('youtube', username, Array.isArray(data) ? data : [data]);

        res.json({ success: true, data, recordId: saved.id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== DATA PERSISTENCE & EXPORT ENDPOINTS ====================

// Get all scraped data history
router.get('/history', (req, res) => {
    const { platform } = req.query;

    let data;
    if (platform && ['tiktok', 'youtube', 'instagram'].includes(platform as string)) {
        data = DataService.getByPlatform(platform as any);
    } else {
        data = DataService.getAll();
    }

    res.json({ success: true, count: data.length, data });
});

// Get single record by ID
router.get('/history/:id', (req, res) => {
    const record = DataService.getById(req.params.id);
    if (!record) {
        return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ success: true, data: record });
});

// Delete a record
router.delete('/history/:id', (req, res) => {
    const deleted = DataService.delete(req.params.id);
    if (!deleted) {
        return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ success: true, message: 'Record deleted' });
});

// Export all data as JSON
router.get('/export/json', (req, res) => {
    const { platform } = req.query;

    let records;
    if (platform && ['tiktok', 'youtube', 'instagram'].includes(platform as string)) {
        records = DataService.getByPlatform(platform as any);
    } else {
        records = DataService.getAll();
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="social_data_export_${Date.now()}.json"`);
    res.send(DataService.exportToJSON(records));
});

// Export all data as CSV
router.get('/export/csv', (req, res) => {
    const { platform } = req.query;

    let records;
    if (platform && ['tiktok', 'youtube', 'instagram'].includes(platform as string)) {
        records = DataService.getByPlatform(platform as any);
    } else {
        records = DataService.getAll();
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="social_data_export_${Date.now()}.csv"`);
    res.send(DataService.exportToCSV(records));
});

// Clear all data (use with caution)
router.delete('/history', (req, res) => {
    DataService.clearAll();
    res.json({ success: true, message: 'All data cleared' });
});

export default router;

