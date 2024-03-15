import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const filePath = path.join(process.cwd(), 'data', 'data.json');
    try {
      fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
      res.status(200).json({ message: '資料保存成功' });
    } catch (error) {
      res.status(500).json({ message: '無法寫入文件', error });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}