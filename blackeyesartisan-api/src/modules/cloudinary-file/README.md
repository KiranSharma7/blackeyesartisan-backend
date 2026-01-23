# Cloudinary File Provider for Medusa 2.0

Custom file module provider that integrates Cloudinary as the file storage backend for Medusa.

## Features

- ✅ **Upload** - Upload product images, documents, and media files to Cloudinary
- ✅ **Delete** - Remove files from Cloudinary storage
- ✅ **Retrieve** - Get files as buffers for processing
- ✅ **Auto-optimization** - Cloudinary automatically optimizes images
- ✅ **CDN delivery** - Files served via Cloudinary's global CDN
- ✅ **Retry logic** - Built-in error handling for failed operations
- ✅ **Performance logging** - Track upload/download times

## Configuration

Add to your `.env` file:

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Get your credentials from: https://cloudinary.com/console

## How It Works

### Upload Flow

1. Medusa calls the `upload()` method with file buffer
2. File is converted to base64 data URI
3. Uploaded to Cloudinary via SDK
4. Returns secure HTTPS URL and public_id
5. URL stored in Medusa database

### Delete Flow

1. Medusa calls `delete()` method with file public_id
2. Provider calls Cloudinary's destroy API
3. File removed from Cloudinary storage

### File Organization

Files are organized in Cloudinary using:
- **Folder**: `blackeyesartisan/` (configurable in medusa-config.ts)
- **Resource type**: Auto-detected (image, video, raw)
- **Unique filenames**: Enabled to prevent conflicts

## Supported File Types

- **Images**: JPG, PNG, GIF, WebP, SVG, etc.
- **Videos**: MP4, WebM, MOV, etc.
- **Documents**: PDF, CSV, etc. (as raw files)

## Usage in Medusa

Once configured, Medusa automatically uses Cloudinary for:

- Product image uploads (Admin dashboard)
- CSV imports/exports
- Custom file uploads via API

### Example: Upload Product Image

```typescript
// In Medusa Admin dashboard
// 1. Create/Edit product
// 2. Upload images via the media uploader
// 3. Images automatically stored in Cloudinary

// Programmatically:
const fileModuleService = container.resolve('file');
const result = await fileModuleService.uploadFile({
  filename: 'product-image.jpg',
  mimeType: 'image/jpeg',
  content: fileBuffer
});
// result.url = "https://res.cloudinary.com/dllzefagw/..."
```

## Advanced Configuration

Edit `medusa-config.ts` to customize:

```typescript
{
  resolve: './src/modules/cloudinary-file',
  id: 'cloudinary',
  options: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, // Use HTTPS
    folder: 'blackeyesartisan', // Cloudinary folder
    upload_preset: 'my-preset' // Optional: use Cloudinary upload preset
  }
}
```

## Monitoring

View uploaded files in Cloudinary Dashboard:
https://cloudinary.com/console/media_library

## Troubleshooting

### Files not uploading

1. Check credentials in `.env`
2. Verify Cloudinary account is active
3. Check logs: `pm2 logs medusa` or console output

### Wrong file URLs

- Ensure `secure: true` is set for HTTPS URLs
- Check folder configuration matches expected path

### Performance issues

- Large files (>10MB) may take longer to upload
- Consider using Cloudinary upload presets for optimization
- Enable auto-format and quality settings in Cloudinary

## Migration from Other Providers

If migrating from S3/DO Spaces:

1. Files remain in old storage (safe to keep)
2. New uploads go to Cloudinary
3. Optionally migrate old files via script
4. Update old URLs in database (run migration)

## API Reference

### CloudinaryFileProviderService

**Methods:**

- `upload(file)` - Upload file to Cloudinary
- `delete(files)` - Delete one or more files
- `getAsBuffer(file)` - Retrieve file as buffer

**Properties:**

- `static identifier = 'cloudinary'` - Provider ID

## Related Documentation

- [Medusa File Module](https://docs.medusajs.com/resources/infrastructure-modules/file)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
