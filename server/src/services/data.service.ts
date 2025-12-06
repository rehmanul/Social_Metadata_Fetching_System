import fs from 'fs';
import path from 'path';

export interface ScrapedData {
    id: string;
    platform: 'tiktok' | 'youtube' | 'instagram';
    username: string;
    scrapedAt: string;
    data: any[];
}

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'scraped_data.json');

// Ensure data directory exists
function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

// Load all scraped data
function loadData(): ScrapedData[] {
    ensureDataDir();
    if (!fs.existsSync(DB_FILE)) {
        return [];
    }
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch {
        return [];
    }
}

// Save all data
function saveData(data: ScrapedData[]): void {
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Generate unique ID
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const DataService = {
    // Save new scrape result
    save(platform: ScrapedData['platform'], username: string, data: any[]): ScrapedData {
        const allData = loadData();
        const record: ScrapedData = {
            id: generateId(),
            platform,
            username,
            scrapedAt: new Date().toISOString(),
            data
        };
        allData.unshift(record); // Add to beginning (newest first)

        // Keep only last 100 records to prevent unlimited growth
        const trimmed = allData.slice(0, 100);
        saveData(trimmed);

        return record;
    },

    // Get all records
    getAll(): ScrapedData[] {
        return loadData();
    },

    // Get by ID
    getById(id: string): ScrapedData | undefined {
        return loadData().find(r => r.id === id);
    },

    // Get by platform
    getByPlatform(platform: ScrapedData['platform']): ScrapedData[] {
        return loadData().filter(r => r.platform === platform);
    },

    // Delete record
    delete(id: string): boolean {
        const allData = loadData();
        const filtered = allData.filter(r => r.id !== id);
        if (filtered.length === allData.length) return false;
        saveData(filtered);
        return true;
    },

    // Clear all data
    clearAll(): void {
        saveData([]);
    },

    // Export to JSON string
    exportToJSON(records?: ScrapedData[]): string {
        const data = records || loadData();
        return JSON.stringify(data, null, 2);
    },

    // Export to CSV
    exportToCSV(records?: ScrapedData[]): string {
        const data = records || loadData();
        if (data.length === 0) return '';

        const rows: string[] = [];

        // Header
        rows.push('id,platform,username,scrapedAt,title,views,likes,comments,shares,url');

        // Data rows
        for (const record of data) {
            for (const item of record.data) {
                const row = [
                    record.id,
                    record.platform,
                    record.username,
                    record.scrapedAt,
                    `"${(item.title || item.desc || item.description || item.text || '').replace(/"/g, '""')}"`,
                    item.playcount || item.play_count || item.views || 0,
                    item.diggcount || item.digg_count || item.likes || 0,
                    item.commentcount || item.comment_count || item.comments || 0,
                    item.sharecount || item.share_count || item.shares || 0,
                    item.video_url || item.url || ''
                ];
                rows.push(row.join(','));
            }
        }

        return rows.join('\n');
    }
};
