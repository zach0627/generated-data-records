import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// 保存資料至 datatable.json
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const filePath = path.join(process.cwd(), 'public', 'datatable.json');
      const data = JSON.stringify(req.body, null, 2);
      fs.writeFileSync(filePath, data, 'utf8');
      res.status(200).json({ message: 'DataTable saved successfully' });
    } catch (error) {
      console.error('Failed to save data table:', error);
      res.status(500).json({ message: 'Failed to save data table' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
