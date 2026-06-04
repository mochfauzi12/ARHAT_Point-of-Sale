import { Hono } from 'hono';
import { AppError } from '../lib/errors';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const uploadRoutes = new Hono();

uploadRoutes.post('/', async (c) => {
  const body = await c.req.parseBody();
  const file = body['file']; // the File object

  if (!file || typeof file === 'string') {
    throw new AppError('No valid file uploaded', 400);
  }

  // Create a unique filename
  const extension = file.name.split('.').pop() || 'png';
  const filename = `${uuidv4()}.${extension}`;
  
  // Save file locally (in production you would use S3/Supabase Storage)
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, filename);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  fs.writeFileSync(filePath, buffer);

  // Return the public URL
  const publicUrl = `/public/uploads/${filename}`;
  
  return c.json({
    success: true,
    data: { url: publicUrl }
  }, 201);
});

export default uploadRoutes;
