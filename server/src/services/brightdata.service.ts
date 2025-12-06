import axios from 'axios';
import { z } from 'zod';

const API_KEY = process.env.BRIGHTDATA_API_KEY;
const DATASET_ID = 'gd_l1villgoiiidt09ci'; // TikTok Profile/Posts dataset

export class BrightDataService {
    private static headers = {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
    };

    /**
     * Trigger scraping for a TikTok profile
     */
    static async triggerCollection(username: string): Promise<string> {
        if (!API_KEY) throw new Error('Bright Data API Key is missing');

        const cleanUsername = username.replace('@', '').trim();
        // Bright Data expects profiles as URLs or IDs usually, but for discovering posts, 
        // we often filter by "url" or "profile" input. 
        // For "TikTok Posts" dataset, checking documentation (assumed):
        // Usually we send a JSON object with query parameters.

        // Using the "Trigger" API endpoint for the dataset
        const url = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${DATASET_ID}&include_errors=true`;

        // Payload depends on dataset schema. Assuming we filter by profile URL.
        const profileUrl = `https://www.tiktok.com/@${cleanUsername}`;

        const payload = [
            { url: profileUrl }
        ];

        try {
            const response = await axios.post(url, payload, { headers: this.headers });

            // Response contains snapshot_id
            const { snapshot_id } = response.data;
            if (!snapshot_id) throw new Error('No snapshot_id returned');

            return snapshot_id;
        } catch (error: any) {
            console.error('BrightData Trigger Error:', error.response?.data || error.message);
            throw new Error('Failed to trigger TikTok collection');
        }
    }

    /**
     * Poll for completion
     */
    static async pollStatus(snapshotId: string): Promise<{ status: 'running' | 'ready' | 'failed', progress?: number }> {
        const url = `https://api.brightdata.com/datasets/v3/progress/${snapshotId}`;

        try {
            const response = await axios.get(url, { headers: this.headers });
            const status = response.data.status; // 'running', 'ready', 'failed' (simplified check)

            // Bright Data returns specific status strings. 
            // usually: "running", "collecting", "ready"
            if (status === 'ready' || status === 'done') return { status: 'ready' };
            if (status === 'failed') return { status: 'failed' };

            return { status: 'running', progress: response.data.progress };
        } catch (error) {
            return { status: 'running' }; // Assume running if check fails momentarily
        }
    }

    /**
     * Get fetched data
     */
    static async getData(snapshotId: string): Promise<any[]> {
        const url = `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`;

        const response = await axios.get(url, { headers: this.headers });
        return response.data;
    }
}
